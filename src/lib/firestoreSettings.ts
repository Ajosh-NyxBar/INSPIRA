/**
 * Firestore Settings and Connection Management
 * Handles Firestore configuration for better stability
 */

import { db } from './firebase';
import { 
  enableNetwork, 
  disableNetwork, 
  waitForPendingWrites,
  enableIndexedDbPersistence,
  connectFirestoreEmulator
} from 'firebase/firestore';

class FirestoreSettings {
  private isInitialized = false;
  private persistenceEnabled = false;

  async initialize() {
    if (this.isInitialized || !db || typeof window === 'undefined') {
      return;
    }

    try {
      console.log('🔧 Initializing Firestore settings...');

      // Enable offline persistence if not already enabled
      if (!this.persistenceEnabled) {
        try {
          await enableIndexedDbPersistence(db, {
            forceOwnership: false
          });
          this.persistenceEnabled = true;
          console.log('💾 Firestore offline persistence enabled');
        } catch (err: any) {
          console.warn('⚠️ Persistence error:', err.code);
          if (err.code === 'failed-precondition') {
            console.log('📑 Multiple tabs open, using existing persistence');
          } else if (err.code === 'unimplemented') {
            console.log('🌐 Browser doesn\'t support persistence');
          }
        }
      }

      // Wait for any pending writes
      try {
        await waitForPendingWrites(db);
        console.log('✅ All pending writes completed');
      } catch (error) {
        console.warn('⚠️ Error waiting for pending writes:', error);
      }

      // Ensure network is enabled
      try {
        await enableNetwork(db);
        console.log('🌐 Firestore network enabled');
      } catch (error) {
        console.warn('⚠️ Network enable error:', error);
      }

      this.isInitialized = true;
      console.log('✅ Firestore settings initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Firestore settings:', error);
    }
  }

  async reconnect() {
    if (!db) return;

    try {
      console.log('🔄 Reconnecting Firestore...');
      
      // Wait for pending writes first
      await waitForPendingWrites(db);
      
      // Disable and re-enable network
      await disableNetwork(db);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await enableNetwork(db);
      
      console.log('✅ Firestore reconnected successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to reconnect Firestore:', error);
      return false;
    }
  }

  async handleConnectionError(error: any) {
    console.log('🚨 Handling Firestore connection error:', error?.message);

    // Handle specific error types
    if (error?.code === 'unavailable' || error?.message?.includes('400')) {
      console.log('🔄 Attempting automatic reconnection...');
      return await this.reconnect();
    }

    if (error?.message?.includes('offline')) {
      console.log('📱 Device is offline, enabling offline mode');
      return true; // Firestore will handle offline automatically
    }

    return false;
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      persistenceEnabled: this.persistenceEnabled,
      dbAvailable: !!db
    };
  }
}

export const firestoreSettings = new FirestoreSettings();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  // Wait a bit for Firebase to fully initialize
  setTimeout(() => {
    firestoreSettings.initialize();
  }, 2000);
}
