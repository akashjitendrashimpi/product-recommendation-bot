// public/sw.js — Qyantra Service Worker
// Handles push notifications + basic offline caching

const CACHE_NAME = 'qyantra-v1'
const OFFLINE_URLS = ['/dashboard', '/auth/login']

// ── Install: pre-cache key pages ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(OFFLINE_URLS).catch(() => {})
    }).then(() => self.skipWaiting())
  )
})

// ── Activate: clean up old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: network first, fallback to cache ──
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request).then(cached => {
          if (cached) return cached
          if (event.request.mode === 'navigate') {
            return caches.match('/dashboard')
          }
          return new Response('Offline', { status: 503 })
        })
      })
  )
})

// ── Push: show notification ──
self.addEventListener('push', function(event) {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Qyantra', body: event.data.text(), url: '/dashboard' }
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/dashboard' },
    actions: [
      { action: 'open', title: '📱 Open App' },
      { action: 'close', title: 'Dismiss' }
    ],
    requireInteraction: false,
    tag: 'qyantra-notification',
    renotify: true,
    silent: false,
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Qyantra', options)
  )
})

// ── Notification click ──
self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  if (event.action === 'close') return

  const url = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.focus()
          if ('navigate' in client) client.navigate(url)
          return
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// ── Notification dismissed ──
self.addEventListener('notificationclose', function(event) {
  // track dismissals here if needed in future
})