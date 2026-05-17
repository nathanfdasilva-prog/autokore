// ============================================================
// SERVICE WORKER — public/sw.js
// Cache estratégico para PWA offline-first.
// ============================================================

const CACHE_NAME  = 'autokore-v1'
const CACHE_STATIC = 'autokore-static-v1'

// Recursos que funcionam offline
const STATIC_ASSETS = [
  '/',
  '/os',
  '/os/nova',
  '/agendamentos',
  '/manifest.json',
]

// ---- Install: pré-cacheia assets estáticos ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      console.log('[SW] Pré-cacheando assets estáticos')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// ---- Activate: limpa caches antigos ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CACHE_STATIC)
          .map(k => {
            console.log('[SW] Removendo cache antigo:', k)
            return caches.delete(k)
          })
      )
    )
  )
  self.clients.claim()
})

// ---- Fetch: estratégia Network-First para API, Cache-First para assets ----
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Ignora requisições não-HTTP e Firebase
  if (!event.request.url.startsWith('http')) return
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('firebaseio')) return

  // Assets estáticos — Cache First
  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style'  ||
    event.request.destination === 'font'   ||
    event.request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached
        return fetch(event.request).then(response => {
          const clone = response.clone()
          caches.open(CACHE_STATIC).then(cache => cache.put(event.request, clone))
          return response
        }).catch(() => cached)
      })
    )
    return
  }

  // Navegação / API — Network First com fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cacheia respostas bem-sucedidas de navegação
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => {
        // Offline: tenta servir do cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached
          // Fallback para página raiz
          if (event.request.destination === 'document') {
            return caches.match('/')
          }
          return new Response('Offline', { status: 503 })
        })
      })
  )
})

// ---- Push notifications (futuro) ----
self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'AutoKore', {
      body:    data.body ?? '',
      icon:    '/icons/icon-192x192.png',
      badge:   '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data:    { url: data.url ?? '/' },
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.url ?? '/')
  )
})
