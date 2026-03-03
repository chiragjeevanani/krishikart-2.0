import admin from 'firebase-admin';

let serviceAccount;
try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (error) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", error.message);
}

if (serviceAccount) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin initialized successfully");
    }
} else {
    console.error("Firebase Admin could not be initialized: FIREBASE_SERVICE_ACCOUNT is missing or invalid");
}

export default admin;
