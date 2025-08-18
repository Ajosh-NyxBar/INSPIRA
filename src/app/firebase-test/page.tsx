'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInAnonymously, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setStatus([]);
    
    try {
      // Test 1: Check Firebase services availability
      addStatus('🔧 Testing Firebase services...');
      addStatus(`Auth available: ${!!auth}`);
      addStatus(`Database available: ${!!db}`);
      
      if (!auth || !db) {
        addStatus('❌ Firebase services not available - may be in demo mode');
        addStatus('Check your .env file and Firebase configuration');
        setIsLoading(false);
        return;
      }

      // Test 2: Try anonymous authentication with better error handling
      addStatus('🔐 Testing authentication...');
      let authSuccess = false;
      try {
        // First try to sign out any existing user
        if (auth.currentUser) {
          await signOut(auth);
          addStatus('📤 Signed out existing user');
        }
        
        // Attempt anonymous sign-in
        const userCredential = await signInAnonymously(auth);
        addStatus(`✅ Anonymous auth successful: ${userCredential.user.uid}`);
        authSuccess = true;
      } catch (authError: any) {
        addStatus(`❌ Auth failed: ${authError.message}`);
        addStatus(`Error code: ${authError.code}`);
        
        // Provide specific guidance for common errors
        if (authError.code === 'auth/admin-restricted-operation') {
          addStatus('💡 Tip: Anonymous authentication may not be enabled in Firebase Console');
          addStatus('Go to Firebase Console > Authentication > Sign-in methods > Anonymous');
        } else if (authError.code === 'auth/network-request-failed') {
          addStatus('💡 Tip: Check your internet connection and Firebase project settings');
        }
        
        // Continue with database tests even if auth fails
        addStatus('⚠️ Continuing with database tests...');
      }

      // Test 3: Database write test (may work without auth depending on rules)
      addStatus('💾 Testing database write...');
      try {
        const testDoc = doc(db, 'test', 'connection');
        await setDoc(testDoc, {
          timestamp: new Date(),
          test: 'Firebase connection test',
          status: 'working',
          authStatus: authSuccess ? 'authenticated' : 'unauthenticated'
        });
        addStatus('✅ Database write successful');
      } catch (writeError: any) {
        addStatus(`❌ Database write failed: ${writeError.message}`);
        addStatus(`Error code: ${writeError.code}`);
        
        if (writeError.code === 'permission-denied') {
          addStatus('💡 Tip: Check Firestore security rules - may require authentication');
        } else if (writeError.code === 'unavailable') {
          addStatus('💡 Tip: Firestore may be offline or having connectivity issues');
        }
      }

      // Test 4: Database read test
      addStatus('📖 Testing database read...');
      try {
        const testDoc = doc(db, 'test', 'connection');
        const docSnap = await getDoc(testDoc);
        if (docSnap.exists()) {
          addStatus('✅ Database read successful');
          addStatus(`Data: ${JSON.stringify(docSnap.data())}`);
        } else {
          addStatus('⚠️ Document does not exist (may have been blocked by security rules)');
        }
      } catch (readError: any) {
        addStatus(`❌ Database read failed: ${readError.message}`);
        addStatus(`Error code: ${readError.code}`);
        
        if (readError.code === 'permission-denied') {
          addStatus('💡 Tip: Check Firestore security rules for read permissions');
        }
      }

      // Test 5: Network connectivity
      addStatus('🌐 Testing network connectivity...');
      try {
        const response = await fetch('https://firebase.google.com/', { 
          method: 'HEAD',
          mode: 'no-cors' 
        });
        addStatus('✅ Firebase servers reachable');
      } catch (networkError) {
        addStatus('❌ Network connectivity issues detected');
      }

    } catch (error: any) {
      addStatus(`❌ General error: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const clearFirebaseCache = () => {
    // Clear browser cache and restart
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      addStatus('🧹 Browser cache cleared');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🔥 Firebase Connection Test
          </h1>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={testFirebaseConnection}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {isLoading ? '🔄 Testing...' : '🧪 Run Connection Test'}
            </button>
            
            <button
              onClick={clearFirebaseCache}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              🧹 Clear Cache & Reload
            </button>
          </div>

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            <div className="text-gray-400 mb-2">Firebase Connection Test Console:</div>
            {status.length === 0 ? (
              <div className="text-gray-500">Click "Run Connection Test" to start...</div>
            ) : (
              status.map((line, index) => (
                <div key={index} className="mb-1">
                  {line}
                </div>
              ))
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🔧 Troubleshooting Tips:</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• <strong>admin-restricted-operation:</strong> Enable Anonymous authentication in Firebase Console</li>
              <li>• <strong>permission-denied:</strong> Check Firestore security rules</li>
              <li>• <strong>400 Bad Request:</strong> Check API key and project configuration</li>
              <li>• <strong>network-request-failed:</strong> Check internet connection and Firebase project status</li>
              <li>• Clear cache if seeing persistent connection errors</li>
              <li>• Verify all environment variables are correctly set</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">🚨 Firebase Console Setup Required:</h3>
            <ol className="text-yellow-700 space-y-1 text-sm list-decimal list-inside">
              <li>Go to <a href="https://console.firebase.google.com" target="_blank" className="underline">Firebase Console</a></li>
              <li>Select your project (inspira-f55e4)</li>
              <li>Go to Authentication → Sign-in methods</li>
              <li>Enable "Anonymous" authentication</li>
              <li>Go to Firestore Database → Rules</li>
              <li>Ensure test documents are allowed to be written</li>
            </ol>
          </div>

          <div className="mt-4">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Main App
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
