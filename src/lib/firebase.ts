/**
 * Firebase Configuration
 * Real-time database and authentication setup
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "inspirahub-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "inspirahub-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "inspirahub-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456789"
};

// Check if we're in demo mode or have invalid config
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
                   process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'AIzaSyDYourActualAPIKeyHere' ||
                   !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
                   process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('YourActual');

console.log('🔥 Firebase Debug Info:');
console.log('- DEMO_MODE env:', process.env.NEXT_PUBLIC_DEMO_MODE);
console.log('- API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 20) + '...');
console.log('- PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('- isDemoMode:', isDemoMode);

let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;

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
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.warn('❌ Firebase initialization failed, falling back to demo mode:', error);
  }
} else {
  console.log('🚀 Running in DEMO MODE - Firebase disabled');
}

// Export Firebase services (null if in demo mode)
export { db, auth, storage };

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
