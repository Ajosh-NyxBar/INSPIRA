/**
 * Firebase Connection Handler
 * Manages Firebase connection status and provides fallback behavior
 */

import { db, auth } from './firebase';
import { enableNetwork, disableNetwork, connectFirestoreEmulator } from 'firebase/firestore';
import { User } from 'firebase/auth';

class FirebaseConnectionHandler {
  private isOnline = true;
  private retryAttempts = 0;
  private maxRetries = 5;
  private retryDelay = 1000;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupConnectionMonitoring();
    this.startConnectionHealthCheck();
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

      // Listen for visibility changes to reconnect when tab becomes active
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.isOnline) {
          console.log('👁️ Tab visible, checking Firebase connection...');
          this.ensureConnection();
        }
      });
    }
  }

  private startConnectionHealthCheck() {
    // Check connection every 30 seconds
    this.connectionCheckInterval = setInterval(() => {
      if (this.isOnline && typeof window !== 'undefined' && navigator.onLine) {
        this.healthCheck();
      }
    }, 30000);
  }

  private async healthCheck() {
    if (!db) return;
    
    try {
      // Try to enable network to test connection
      await enableNetwork(db);
      if (this.retryAttempts > 0) {
        console.log('✅ Firebase connection restored after health check');
        this.retryAttempts = 0;
      }
    } catch (error) {
      console.warn('⚠️ Firebase health check failed:', error);
      this.retryAttempts++;
      if (this.retryAttempts >= this.maxRetries) {
        console.log('🔄 Max retries reached, will try to reconnect...');
        this.forceReconnect();
      }
    }
  }

  private async forceReconnect() {
    if (!db) return;
    
    try {
      console.log('🔄 Force reconnecting Firebase...');
      
      // Disable then re-enable network
      await disableNetwork(db);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await enableNetwork(db);
      
      console.log('✅ Force reconnection completed');
      this.retryAttempts = 0;
    } catch (error) {
      console.warn('⚠️ Force reconnection failed:', error);
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
      console.warn('⚠️ Firebase operation failed:', error?.message || error);
      
      // Import Firestore settings for connection handling
      try {
        const { firestoreSettings } = await import('./firestoreSettings');
        const handled = await firestoreSettings.handleConnectionError(error);
        
        if (handled) {
          // Retry operation once after handling
          try {
            return await operation();
          } catch (retryError) {
            console.warn('⚠️ Retry failed, using fallback:', retryError);
            return fallback as T;
          }
        }
      } catch (importError) {
        console.warn('⚠️ Could not import firestoreSettings:', importError);
      }
      
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
        console.warn('🌐 Network/WebChannel error, using fallback');
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
