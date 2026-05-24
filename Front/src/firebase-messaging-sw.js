importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyA9sVcNzFHpSs21NpCDl3Xd7VtwnsR_KME",
  authDomain: "proyecto-tfg---dam.firebaseapp.com",
  projectId: "proyecto-tfg---dam",
  storageBucket: "proyecto-tfg---dam.firebasestorage.app",
  messagingSenderId: "1087816919012",
  appId: "1:1087816919012:web:9411448c709c3f64c189f1",
  measurementId: "G-3KEPSELXH4"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title || 'Aviso';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/images/daemon-logo3.png',
    badge: '/assets/images/daemon-logo3.png',
    data: {
      url: payload.data ? payload.data.url : '/user-messages'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ NUEVO: Manejador de click para abrir la URL recibida
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si ya hay una pestaña abierta con la app, la enfocamos y navegamos
      for (let client of windowClients) {
        if (client.url.indexOf(urlToOpen) !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrimos una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});