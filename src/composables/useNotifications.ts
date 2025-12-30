import { ref } from 'vue'
import { useJournalStore } from '@/stores/journal'
import { useSettingsStore } from '@/stores/settings'
import { messaging, db, auth } from '@/firebase'
import { getToken } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'

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

  // Subscribe to Push Notifications (FCM)
  const subscribeToPush = async (): Promise<string | null> => {
    try {
      const permission = await requestPermission()
      if (!permission) return null

      // Ensure we have a service worker registration
      // In PWA, we should use the registration that handles the app
      let registration = await navigator.serviceWorker.getRegistration()

      if (!registration) {
         console.warn('No active Service Worker found. Waiting for it...')
         registration = await navigator.serviceWorker.ready
      }

      if (!registration) {
          console.error('Service Worker registration failed or not available.')
          return null
      }

      // Get FCM Token using the specific SW registration
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      })

      if (token) {
        console.log('FCM Token received:', token)

        // Save token and preferences to Firestore
        await saveNotificationPreferences(token)

        return token
      } else {
        console.warn('No registration token available. Request permission to generate one.')
        return null
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error)
      return null
    }
  }

  // Check if user has logged today
  const hasLoggedToday = (): boolean => {
    const today = new Date().toLocaleDateString()
    return journalStore.entries.some(entry => {
      return new Date(entry.date).toLocaleDateString() === today
    })
  }

  // Show notification (Legacy/Foreground)
  const showReminder = () => {
    if (globalThis.Notification?.permission === 'granted' && !hasLoggedToday()) {
      const n = new globalThis.Notification('Aura - Time to reflect', {
        body: "Don't forget to log your daily entry! 📝",
        icon: '/aura/logo.jpg',
        badge: '/aura/logo.jpg',
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

        // Optionally subscribe to push if already granted to ensure token is fresh
        // But we usually do this on settings toggle to avoid overhead
      } else if (globalThis.Notification !== undefined) {
        notificationPermission.value = globalThis.Notification.permission
      }
    }
  }

  // Save notification preferences to Firestore
  const saveNotificationPreferences = async (token?: string) => {
    const user = auth.currentUser
    if (!user) return

    const parts = settingsStore.reminderTime.split(':').map(Number)
    const date = new Date()
    date.setHours(parts[0] ?? 20, parts[1] ?? 0, 0, 0)

    const utcHour = date.getUTCHours()

    try {
      const userRef = doc(db, 'users', user.uid)
      const data = {
        reminderTime: settingsStore.reminderTime,
        reminderHourUTC: utcHour,
        locale: settingsStore.locale,
        updatedAt: Date.now(),
        ...(token ? { fcmToken: token } : {})
      }

      await setDoc(userRef, data, { merge: true })
      console.log('Notification preferences saved:', data)
    } catch (e) {
      console.error('Error saving preferences:', e)
    }
  }

  return {
    notificationPermission,
    requestPermission,
    subscribeToPush,
    hasLoggedToday,
    showReminder,
    scheduleReminder,
    init,
    saveNotificationPreferences
  }
}
