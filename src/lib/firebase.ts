
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {"apiKey":"API_KEY","authDomain":"PROJECT_ID.firebaseapp.com","projectId":"PROJECT_ID","storageBucket":"PROJECT_ID.appspot.com","messagingSenderId":"SENDER_ID","appId":"APP_ID","measurementId":"G-MEASUREMENT_ID"};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);

export { app, db, auth };
