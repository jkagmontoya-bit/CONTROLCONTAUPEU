import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, OAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore database
const db = getFirestore(app);

// Firebase Storage
const storage = getStorage(app);

// Firebase Auth
const auth = getAuth(app);

// Microsoft OAuth Provider for @upeu.edu.pe accounts
const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({
  // Restrict to UPeU tenant
  tenant: 'upeu.edu.pe',
  // Prompt user to select account on each sign-in
  prompt: 'select_account',
});
// Request email and profile scopes
microsoftProvider.addScope('openid');
microsoftProvider.addScope('profile');
microsoftProvider.addScope('email');

export { app, db, storage, auth, microsoftProvider };
