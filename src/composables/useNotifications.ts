import { ref } from 'vue'
import { useJournalStore } from '@/stores/journal'
import { useSettingsStore } from '@/stores/settings'

export function useNotifications() {
  const notificationPermission = ref<NotificationPermission>('default')
  const journalStore = useJournalStore()
  const settingsStore = useSettingsStore()

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in globalThis)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      notificationPermission.value = 'granted'
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      notificationPermission.value = permission
      return permission === 'granted'
    }

    notificationPermission.value = Notification.permission
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
    if (Notification.permission === 'granted' && !hasLoggedToday()) {
      new Notification('Aura - Time to reflect', {
        body: 'Don\'t forget to log your daily entry! 📝',
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        tag: 'daily-reminder',
        requireInteraction: false
      })
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
      showReminder()
      // Re-schedule for next day
      scheduleReminder()
    }, timeUntilReminder)
  }

  // Initialize notifications
  const init = async () => {
    if (settingsStore.reminderEnabled) {
      const granted = await requestPermission()
      if (granted) {
        scheduleReminder()
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
