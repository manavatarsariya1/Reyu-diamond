import admin from "firebase-admin";

type Bucket = ReturnType<admin.storage.Storage["bucket"]>;

let serviceAccount;

if (process.env.FIREBASE_CONFIG) {
  // ✅ Production (Render)
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
} else {
  // ✅ Local fallback (optional)
  serviceAccount = await import("../config/reyuDiamondKey.json", {
    assert: { type: "json" }
  });
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: "reyu-diamond-app.appspot.com",
  });
}

export const db = admin.firestore();
export const fcm = admin.messaging();
export const bucket: Bucket = admin.storage().bucket();

export default admin;