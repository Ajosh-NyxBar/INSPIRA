// Firebase Connection Test Script
// This will help diagnose Firebase connection issues

export function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection...');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('- API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 20) + '...');
  console.log('- AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  console.log('- PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('- STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  console.log('- MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
  console.log('- APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
  console.log('- DEMO_MODE:', process.env.NEXT_PUBLIC_DEMO_MODE);
  
  // Import Firebase services
  try {
    const { auth, db } = require('./firebase');
    console.log('✅ Firebase imports successful');
    console.log('- Auth available:', !!auth);
    console.log('- Database available:', !!db);
    
    if (auth && db) {
      console.log('✅ Firebase services initialized successfully');
      return true;
    } else {
      console.log('❌ Firebase services not available');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase import error:', error);
    return false;
  }
}

// Test connection when this file is imported
if (typeof window !== 'undefined') {
  testFirebaseConnection();
}
