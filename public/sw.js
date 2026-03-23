// public/sw.js — Qyantra Service Worker
// Handles push notifications + basic offline caching

const CACHE_NAME = 'qyantra-v2'
const OFFLINE_URLS = ['/dashboard', '/auth/login']
const ICON_URL = '/web-app-manifest-192x192.png'

// ── CRITICAL: message handler must be at top level ────────────────────────
// Chrome requires this to be registered during initial script evaluation
self.addEventListener('message', function(event) {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data?.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.addAll(event.data.urls || []))
    )
  }
})

// ── Install: pre-cache key pages ──────────────────────────────────────────
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  )
})

// ── Activate: clean up old caches ─────────────────────────────────────────
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ── Fetch: network first, fallback to cache ───────────────────────────────
self.addEventListener('fetch', function(event) {
  // Only handle GET requests
  if (event.request.method !== 'GET') return
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return
  // Never cache API routes
  if (event.request.url.includes('/api/')) return
  // Never cache OneSignal requests
  if (event.request.url.includes('onesignal')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && response.status < 400) {
          const clone = response.clone()
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone))
            .catch(() => {})
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cached => {
            if (cached) return cached
            if (event.request.mode === 'navigate') {
              return caches.match('/dashboard') ||
                new Response('Offline — please reconnect', {
                  status: 503,
                  headers: { 'Content-Type': 'text/plain' }
                })
            }
            return new Response('Offline', { status: 503 })
          })
      })
  )
})

// ── Push: show notification ───────────────────────────────────────────────
self.addEventListener('push', function(event) {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = {
      title: 'Qyantra',
      body: event.data.text(),
      url: '/dashboard'
    }
  }

  const options = {
    body: data.body || '',
    icon: data.icon || ICON_URL,
    badge: ICON_URL,
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

// ── Notification click ────────────────────────────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  if (event.action === 'close') return

  const url = event.notification.data?.url || '/dashboard'

  // Validate URL — only allow same-origin
  let safeUrl = '/dashboard'
  try {
    const parsed = new URL(url, self.location.origin)
    if (parsed.origin === self.location.origin) {
      safeUrl = parsed.pathname + parsed.search
    }
  } catch {
    safeUrl = '/dashboard'
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Focus existing window if open
        for (const client of clientList) {
          if (
            client.url.startsWith(self.location.origin) &&
            'focus' in client
          ) {
            client.focus()
            if ('navigate' in client) client.navigate(safeUrl)
            return
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(safeUrl)
        }
      })
  )
})

// ── Notification dismissed ────────────────────────────────────────────────
self.addEventListener('notificationclose', function(event) {
  // Future: track dismissal analytics
})