/**
 * Firebase Configuration
 * Real-time database and authentication setup
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, RecaptchaVerifier, connectAuthEmulator } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
// Real configuration from Firebase Console
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC2v6tIowAQLJV9PVC8gVOE0bFiTJ45Tko",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "inspira-f55e4.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "inspira-f55e4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "inspira-f55e4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "466689963083",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:466689963083:web:9775a8fdb8089c65b849ce",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DWEX1C1N9Z"
};

// Check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
                   !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
                   process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'AIzaSyDYourActualAPIKeyHere' ||
                   process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.includes('yourWebAppIdHere');

console.log('🔥 Firebase Debug Info:');
console.log('- DEMO_MODE env:', process.env.NEXT_PUBLIC_DEMO_MODE);
console.log('- API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 20) + '...');
console.log('- PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('- isDemoMode:', isDemoMode);

let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;
let analytics: any = null;

// Only initialize Firebase if not in demo mode and config is valid
if (!isDemoMode) {
  console.log('🔥 Initializing Firebase...');
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase services
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    // Configure Firestore for better connectivity
    if (typeof window !== 'undefined') {
      // Import and initialize Firestore settings
      import('./firestoreSettings').then(({ firestoreSettings }) => {
        firestoreSettings.initialize();
      }).catch(error => {
        console.warn('⚠️ Failed to load Firestore settings:', error);
      });

      // Basic network enable with timeout
      setTimeout(() => {
        enableNetwork(db).catch((error) => {
          console.warn('⚠️ Could not enable Firestore network:', error);
        });
      }, 1000);
    }    // Initialize Analytics only in browser
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
          console.log('📊 Firebase Analytics initialized');
        }
      }).catch((error) => {
        console.warn('⚠️ Analytics initialization failed:', error);
      });
    }
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.warn('❌ Firebase initialization failed, falling back to demo mode:', error);
    // Reset to null if initialization fails
    app = null;
    db = null;
    auth = null;
    storage = null;
    analytics = null;
  }
} else {
  console.log('🚀 Running in DEMO MODE - Firebase disabled');
}

// Export Firebase services (null if in demo mode)
export { db, auth, storage, analytics };

// OAuth providers (only if not in demo mode)
export const googleProvider = !isDemoMode && auth ? new GoogleAuthProvider() : null;
export const githubProvider = !isDemoMode && auth ? new GithubAuthProvider() : null;

// Configure providers if they exist
if (googleProvider) {
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
}

if (githubProvider) {
  githubProvider.addScope('user:email');
}

export default app;
