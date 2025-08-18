import { auth } from './firebase';
import { firebaseRestClient } from './firebaseRestApi';

export async function testRestApi() {
  console.log('🧪 Starting REST API test...');
  
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.log('❌ No authenticated user found');
      return;
    }
    
    console.log('✅ User authenticated:', auth.currentUser.uid);
    
    // Test 1: Get document
    try {
      console.log('📖 Testing GET document...');
      const testDoc = await firebaseRestClient.getDocument('users', auth.currentUser.uid);
      console.log('✅ GET success:', testDoc ? 'Document found' : 'Document not found');
    } catch (error) {
      console.log('⚠️ GET error:', error);
    }
    
    // Test 2: Set document
    try {
      console.log('📝 Testing SET document...');
      const testData = {
        testField: 'Hello from REST API',
        timestamp: new Date().toISOString(),
        uid: auth.currentUser.uid
      };
      
      await firebaseRestClient.setDocument('test', 'rest-api-test', testData);
      console.log('✅ SET success');
    } catch (error) {
      console.log('⚠️ SET error:', error);
    }
    
    // Test 3: Get the test document we just created
    try {
      console.log('📖 Testing GET test document...');
      const testDoc = await firebaseRestClient.getDocument('test', 'rest-api-test');
      console.log('✅ GET test doc success:', testDoc);
    } catch (error) {
      console.log('⚠️ GET test doc error:', error);
    }
    
    console.log('🏁 REST API test completed');
    
  } catch (error) {
    console.error('❌ REST API test failed:', error);
  }
}

// Auto-run if user is available
if (typeof window !== 'undefined') {
  auth.onAuthStateChanged((user: any) => {
    if (user) {
      console.log('🔄 User detected, running REST API test...');
      testRestApi();
    }
  });
}
