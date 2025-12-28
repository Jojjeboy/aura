import { ref } from 'vue'
import { useJournalStore } from '@/stores/journal'
import { useSettingsStore } from '@/stores/settings'

// Shared state for notification permission
const notificationPermission = ref<NotificationPermission | 'not-supported'>(
  globalThis.Notification === undefined ? 'not-supported' : globalThis.Notification.permission
)

export function useNotifications() {
  const journalStore = useJournalStore()
  const settingsStore = useSettingsStore()

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (globalThis.Notification === undefined) {
      console.warn('This browser does not support notifications')
      notificationPermission.value = 'not-supported'
      return false
    }

    if (globalThis.Notification.permission === 'granted') {
      notificationPermission.value = 'granted'
      return true
    }

    if (globalThis.Notification.permission !== 'denied') {
      try {
        const permission = await globalThis.Notification.requestPermission()
        notificationPermission.value = permission
        return permission === 'granted'
      } catch (error) {
        console.error('Error requesting notification permission:', error)
        return false
      }
    }

    notificationPermission.value = globalThis.Notification.permission
    return false
  }

  // Check if user has logged today
  const hasLoggedToday = (): boolean => {
    const today = new Date().toLocaleDateString()
    return journalStore.entries.some(entry => {
      return new Date(entry.date).toLocaleDateString() === today
    })
  }

  // Show notification
  const showReminder = () => {
    if (globalThis.Notification?.permission === 'granted' && !hasLoggedToday()) {
      const n = new globalThis.Notification('Aura - Time to reflect', {
        body: 'Don\'t forget to log your daily entry! 📝',
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        tag: 'daily-reminder',
        requireInteraction: false
      })
      console.log('Notification shown:', n.title)
    }
  }

  // Schedule daily reminder
  const scheduleReminder = () => {
    if (!settingsStore.reminderEnabled) return

    const parts = settingsStore.reminderTime.split(':').map(Number)
    const hours = parts[0] ?? 20
    const minutes = parts[1] ?? 0

    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(hours, minutes, 0, 0)

    // If the scheduled time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const timeUntilReminder = scheduledTime.getTime() - now.getTime()

    // Schedule the reminder
    setTimeout(() => {
      // Re-check enabled state before showing
      if (settingsStore.reminderEnabled) {
        showReminder()
        // Re-schedule for next day
        scheduleReminder()
      }
    }, timeUntilReminder)
  }

  // Initialize notifications
  const init = async () => {
    if (settingsStore.reminderEnabled) {
      // Don't auto-request on init as browsers might block it
      // Just check current state and schedule if granted
      if (globalThis.Notification?.permission === 'granted') {
        notificationPermission.value = 'granted'
        scheduleReminder()
      } else if (globalThis.Notification !== undefined) {
        notificationPermission.value = globalThis.Notification.permission
      }
    }
  }

  return {
    notificationPermission,
    requestPermission,
    hasLoggedToday,
    showReminder,
    scheduleReminder,
    init
  }
}
