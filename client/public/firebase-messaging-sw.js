importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "dKBt2e24MTAhkdhLfVpfbnwMFmEc",
    authDomain: "reyu-diamond.firebaseapp.com",
    projectId: "reyu-diamond",
    storageBucket: "reyu-diamond.firebasestorage.app",
    messagingSenderId: "785997011645",
    appId: "1:785997011645:web:2eec96ac2e49dba676f5d4",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    // Check if any client windows are open and focused
    return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
            const isAppInForeground = clientList.some(client => client.focused);
            
            if (isAppInForeground) {
                console.log('[firebase-messaging-sw.js] App is in foreground, skipping native notification.');
                return;
            }

            const notificationTitle = payload.notification.title;
            const notificationOptions = {
                body: payload.notification.body,
                icon: '/vite.svg',
                data: payload.data, // Keep the data for clicks
            };

            return self.registration.showNotification(notificationTitle, notificationOptions);
        });
});
