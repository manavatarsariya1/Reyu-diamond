import { getToken } from "firebase/messaging";
import { messaging } from "@/firebase/fcm";

export const generateFcmToken = async () => {
  try {
    const token = await getToken(messaging, {
    //   vapidKey: "YOUR_VAPID_KEY",
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    console.log("FCM Token:", token);

    // send to backend
    await fetch("/api/save-token", {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("FCM error:", error);
  }
};
