// Background Sync & Periodic Sync event handlers for PWABuilder & Windows integration

// 1. Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-answers' || event.tag === 'submit-quiz' || event.tag === 'background-sync') {
    event.waitUntil(Promise.resolve());
  }
});

// 2. Periodic Background Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'chsb-periodic-sync' || event.tag === 'content-sync') {
    event.waitUntil(Promise.resolve());
  }
});

// 3. Push Notifications
self.addEventListener('push', (event) => {
  const title = 'CHSB Prep';
  const options = {
    body: event.data ? event.data.text() : 'Yangi 7-sinf ChSB mashg‘ulotlari!',
    icon: '/pwa-192x192.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('/');
    })
  );
});

// 4. Windows 11 Widget event listeners
self.addEventListener('widgetinstall', (event) => {
  event.waitUntil(Promise.resolve());
});

self.addEventListener('widgetuninstall', (event) => {
  event.waitUntil(Promise.resolve());
});

self.addEventListener('widgetresume', (event) => {
  event.waitUntil(Promise.resolve());
});
