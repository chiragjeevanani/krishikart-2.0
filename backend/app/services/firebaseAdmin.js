import admin from 'firebase-admin';
import fs from 'fs';

let serviceAccount = null;

// Prefer explicit JSON in FIREBASE_SERVICE_ACCOUNT, then fallback to file path
const rawEnvConfig = process.env.FIREBASE_SERVICE_ACCOUNT;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (rawEnvConfig && rawEnvConfig.trim() !== 'undefined') {
    try {
        serviceAccount = JSON.parse(rawEnvConfig);
    } catch (error) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", error.message);
    }
} else if (serviceAccountPath) {
    try {
        const fileContents = fs.readFileSync(serviceAccountPath, 'utf8');
        serviceAccount = JSON.parse(fileContents);
    } catch (error) {
        console.error(`Error reading or parsing FIREBASE_SERVICE_ACCOUNT_PATH (${serviceAccountPath}):`, error.message);
    }
}

if (serviceAccount) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin initialized successfully");
    }
} else {
    console.error("Firebase Admin could not be initialized: no valid Firebase service account configuration found");
}

export default admin;
