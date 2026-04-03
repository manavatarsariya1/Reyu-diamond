import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFCMToken = async () => {
    try {
        console.log("Requesting FCM permission...");
        if (!('Notification' in window)) {
            console.error("This browser does not support desktop notification");
            return null;
        }

        const permission = await Notification.requestPermission();
        console.log("Notification permission status:", permission);

        if (permission === 'granted') {
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            console.log("Using VAPID Key:", vapidKey ? "PRESENTS" : "MISSING");

            // Explicitly register service worker for better reliability
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            
            // Wait for the service worker to be ready and active
            await navigator.serviceWorker.ready;
            console.log("Service Worker is ready and active:", registration.scope);

            const token = await getToken(messaging, {
                vapidKey: vapidKey,
                serviceWorkerRegistration: registration,
            });

            if (token) {
                console.log('✅ FCM Token generated:', token);
                return token;
            } else {
                console.warn('⚠️ No registration token available.');
                return null;
            }
        } else {
            console.warn('❌ Notification permission not granted. Status:', permission);
            return null;
        }
    } catch (error) {
        console.error('💥 An error occurred while retrieving token:', error);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log('Foreground Message received:', payload);
            resolve(payload);
        });
    });

export { messaging };
