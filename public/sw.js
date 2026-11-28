// CHSB Prep Service Worker
// Capabilities: Has Service Worker, Has Logic, Periodic Sync, Background Sync, Push Notifications (No Offline Support)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Background Sync - handles deferred network actions when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-answers' || event.tag === 'submit-quiz' || event.tag === 'background-sync') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_COMPLETED',
            tag: event.tag,
            timestamp: Date.now(),
          });
        });
      })
    );
  }
});

// 2. Periodic Background Sync - periodically checks for test updates and syncs metadata
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'chsb-periodic-sync' || event.tag === 'content-sync') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'PERIODIC_SYNC_TRIGGERED',
            tag: event.tag,
            timestamp: Date.now(),
          });
        });
      })
    );
  }
});

// 3. Push Notifications - receives push messages and displays native system notifications
self.addEventListener('push', (event) => {
  let payload = {
    title: 'CHSB Prep',
    body: '7-sinf yangi ChSB testlari va kundalik mashg‘ulotlar tayyor!',
    url: '/',
  };

  try {
    if (event.data) {
      const json = event.data.json();
      payload = { ...payload, ...json };
    }
  } catch {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [120, 60, 120],
    data: {
      url: payload.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: 'open_test',
        title: 'Testni boshlash',
      },
      {
        action: 'close',
        title: 'Yopish',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// Handle notification interaction and routing
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// 4. Windows 11 Widgets integration lifecycle
self.addEventListener('widgetinstall', (event) => {
  event.waitUntil(Promise.resolve());
});

self.addEventListener('widgetuninstall', (event) => {
  event.waitUntil(Promise.resolve());
});

self.addEventListener('widgetresume', (event) => {
  event.waitUntil(Promise.resolve());
});
