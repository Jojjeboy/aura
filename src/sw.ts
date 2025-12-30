/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { db } from './db'

declare let self: ServiceWorkerGlobalScope

// Standard PWA precaching
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.skipWaiting()
clientsClaim()

// Handle Push Events
self.addEventListener('push', (event) => {
  if (!event.data) return

  const promiseChain = (async () => {
    try {
      console.log('[SW] Push received')
      // 1. Check if user has logged today
      const today = new Date().toLocaleDateString()
      console.log('[SW] Checking for entry on date:', today)
      const entries = await db.journal_entries.where('date').equals(today).toArray()
      console.log('[SW] Found entries:', entries.length)

      // 2. If already logged, don't show notification
      if (entries.length > 0) {
        console.log('[SW] User already logged today. Skipping notification.')
        return
      }

      // 3. Otherwise, show notification
      const data = event.data.json()
      const title = data.title || 'Aura - Time to reflect'
      const options = {
        body: data.body || 'Don\'t forget to log your daily entry! 📝',
        icon: 'logo.jpg',
        badge: 'logo.jpg',
        tag: 'daily-reminder',
        data: {
          url: self.location.origin + '/aura/'
        }
      }

      await self.registration.showNotification(title, options)
      console.log('[SW] Notification shown (allegedly)')
    } catch (error) {
      console.error('[SW] Error handling push event:', error)
    }
  })()

  event.waitUntil(promiseChain)
})

// Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || self.location.origin + '/aura/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a browser tab is already open, focus it
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return (client as WindowClient).focus()
        }
      }
      // If no tab is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})
