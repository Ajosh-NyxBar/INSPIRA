/**
 * Firebase Connection Handler
 * Manages Firebase connection status and provides fallback behavior
 */

import { db, auth } from './firebase';
import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { User } from 'firebase/auth';

class FirebaseConnectionHandler {
  private isOnline = true;
  private retryAttempts = 0;
  private maxRetries = 3;
  private retryDelay = 2000;

  constructor() {
    this.setupConnectionMonitoring();
  }

  private setupConnectionMonitoring() {
    if (typeof window !== 'undefined') {
      // Monitor browser online/offline status
      window.addEventListener('online', () => {
        console.log('🔗 Browser back online, attempting to reconnect Firebase...');
        this.handleOnline();
      });

      window.addEventListener('offline', () => {
        console.log('📱 Browser offline, Firebase will work in offline mode');
        this.handleOffline();
      });

      // Monitor Firebase auth state changes
      if (auth) {
        auth.onAuthStateChanged((user: User | null) => {
          if (user) {
            console.log('👤 User authenticated, ensuring Firebase connection...');
            this.ensureConnection();
          }
        });
      }
    }
  }

  private async handleOnline() {
    this.isOnline = true;
    if (db) {
      try {
        await enableNetwork(db);
        console.log('✅ Firebase connection restored');
        this.retryAttempts = 0;
      } catch (error) {
        console.warn('⚠️ Failed to restore Firebase connection:', error);
        this.scheduleRetry();
      }
    }
  }

  private async handleOffline() {
    this.isOnline = false;
    if (db) {
      try {
        await disableNetwork(db);
        console.log('📴 Firebase offline mode enabled');
      } catch (error) {
        console.warn('⚠️ Failed to enable offline mode:', error);
      }
    }
  }

  private scheduleRetry() {
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      setTimeout(() => {
        console.log(`🔄 Retry attempt ${this.retryAttempts}/${this.maxRetries}`);
        this.ensureConnection();
      }, this.retryDelay * this.retryAttempts);
    } else {
      console.warn('❌ Max retry attempts reached, Firebase may be unavailable');
    }
  }

  private async ensureConnection() {
    if (!this.isOnline || !db) return;

    try {
      await enableNetwork(db);
      console.log('✅ Firebase connection verified');
      this.retryAttempts = 0;
    } catch (error) {
      console.warn('⚠️ Firebase connection check failed:', error);
      this.scheduleRetry();
    }
  }

  public async executeWithRetry<T>(operation: () => Promise<T>, fallback?: T): Promise<T> {
    if (!db || !auth) {
      console.warn('⚠️ Firebase not available, using fallback');
      return fallback as T;
    }

    try {
      return await operation();
    } catch (error: any) {
      console.warn('⚠️ Firebase operation failed:', error);
      
      // Handle specific Firebase errors
      if (error?.code === 'failed-precondition' || 
          error?.message?.includes('offline') ||
          error?.message?.includes('client is offline')) {
        console.log('📴 Operating in offline mode');
        return fallback as T;
      }

      // Handle permission errors
      if (error?.code === 'permission-denied') {
        console.warn('🔒 Permission denied - check Firestore rules');
        return fallback as T;
      }

      // Handle network and WebChannel errors
      if (error?.code === 'unavailable' || 
          error?.message?.includes('400') ||
          error?.message?.includes('Bad Request') ||
          error?.message?.includes('WebChannelConnection') ||
          error?.message?.includes('transport errored')) {
        console.warn('🌐 Network/WebChannel error, retrying...');
        this.scheduleRetry();
        return fallback as T;
      }

      // Handle authentication errors
      if (error?.code === 'admin-restricted-operation') {
        console.warn('🔒 Authentication method restricted - check Firebase Console settings');
        return fallback as T;
      }

      throw error; // Re-throw unknown errors
    }
  }

  public getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      hasAuth: !!auth,
      hasDB: !!db,
      retryAttempts: this.retryAttempts
    };
  }
}

// Export singleton instance
export const firebaseConnectionHandler = new FirebaseConnectionHandler();

// Export utility function
export function withFirebaseRetry<T>(operation: () => Promise<T>, fallback?: T): Promise<T> {
  return firebaseConnectionHandler.executeWithRetry(operation, fallback);
}
