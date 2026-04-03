import admin from "firebase-admin";

type Bucket = ReturnType<admin.storage.Storage["bucket"]>;

// ✅ Get from ENV
const rawConfig = process.env.FIREBASE_CONFIG;

if (!rawConfig) {
  throw new Error("FIREBASE_CONFIG is not set in environment variables");
}

// ✅ Parse JSON
const serviceAccount = JSON.parse(rawConfig);

// ✅ Fix private key formatting
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

// ✅ Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: "reyu-diamond-app.appspot.com",
  });
}

// ✅ Exports
export const db = admin.firestore();
export const fcm: admin.messaging.Messaging = admin.messaging();
export const bucket: Bucket = admin.storage().bucket();

export default admin;