// Сервис-воркер приложения "Гриль Мастер" — отвечает только за
// push-уведомления о статусе заказа. Должен лежать в той же папке,
// что и сам HTML-файл приложения (регистрируется как 'sw.js',
// относительный путь).
//
// ВАЖНО: сервис-воркеры работают только по HTTPS (или на localhost при
// разработке) — при открытии приложения напрямую с диска (file://)
// браузер не позволит его зарегистрировать, и push-уведомления будут
// недоступны, пока приложение не окажется на настоящем HTTPS-домене.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Пришло push-сообщение от бэкенда (отправлено через web-push при смене
// статуса заказа) — показываем системное уведомление.
self.addEventListener('push', (event) => {
  let data = { title: 'Гриль Мастер', body: 'Обновление по вашему заказу' };
  try{
    if(event.data) data = event.data.json();
  } catch(err){
    if(event.data) data.body = event.data.text();
  }

  const title = data.title || 'Гриль Мастер';
  const options = {
    body: data.body || '',
    // Иконку уведомления можно добавить позже — положите файл рядом
    // (например icon-192.png) и укажите его здесь: icon: 'icon-192.png'.
    // Без неё браузер покажет уведомление со своей иконкой по умолчанию.
    data: { orderId: data.orderId || null },
    tag: data.orderId ? ('order-' + data.orderId) : undefined, // новые уведомления по тому же заказу заменяют предыдущее, а не копятся
    renotify: !!data.orderId
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Клик по уведомлению — открываем (или фокусируем) вкладку с приложением
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
