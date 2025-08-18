/**
 * Firebase User Service
 * Handles user authentication and user data with Firebase
 */

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signInWithPhoneNumber,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  ConfirmationResult,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider } from './firebase';
import { User, Notification } from '@/types/phase3';

// Demo mode for development without Firebase setup
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
                  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'AIzaSyDYourActualAPIKeyHere' ||
                  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
                  process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('YourActual');

console.log('👤 UserService Debug Info:');
console.log('- DEMO_MODE:', DEMO_MODE);
console.log('- Auth available:', !!auth);
console.log('- DB available:', !!db);

if (DEMO_MODE) {
  console.log('🚀 UserService running in DEMO MODE');
} else {
  console.log('🔥 UserService running with Firebase');
}

class FirebaseUserService {
  private currentUser: User | null = null;
  private authUnsubscribe: (() => void) | null = null;

  constructor() {
    if (!DEMO_MODE) {
      this.initializeAuth();
    }
  }

  private initializeAuth() {
    if (!auth) return; // Skip if auth is not initialized
    
    this.authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await this.loadUserProfile(firebaseUser.uid);
      } else {
        this.currentUser = null;
      }
    });
  }

  async register(userData: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    if (DEMO_MODE) {
      return this.demoRegister(userData);
    }

    if (!auth || !db) {
      return { success: false, error: 'Layanan Firebase tidak tersedia' };
    }

    try {
      // Check if username is already taken
      const usernameExists = await this.checkUsernameExists(userData.username);
      if (usernameExists) {
        return { success: false, error: 'Username sudah digunakan' };
      }

      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );

      // Update Firebase auth profile
      await updateProfile(userCredential.user, {
        displayName: userData.displayName
      });

      // Create user profile in Firestore
      const newUser: User = {
        id: userCredential.user.uid,
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        joinDate: new Date().toISOString(),
        stats: {
          quotesShared: 0,
          favoriteCount: 0,
          followersCount: 0,
          followingCount: 0,
          totalLikes: 0
        },
        preferences: {
          theme: 'auto',
          language: 'id',
          notifications: {
            newFollowers: true,
            quoteLikes: true,
            newQuotes: true
          },
          privacy: {
            profilePublic: true,
            showStats: true,
            allowMessages: true
          }
        },
        isVerified: false,
        badges: []
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      this.currentUser = newUser;

      return { success: true, user: newUser };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (DEMO_MODE) {
      return this.demoLogin(email, password);
    }

    if (!auth) {
      return { success: false, error: 'Layanan autentikasi tidak tersedia' };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await this.loadUserProfile(userCredential.user.uid);
      
      return { success: true, user: this.currentUser! };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  async loginWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
    if (DEMO_MODE) {
      return { success: false, error: 'OAuth tidak tersedia dalam mode demo' };
    }

    if (!googleProvider || !auth) {
      return { success: false, error: 'Google provider tidak tersedia' };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile
        const username = await this.generateUniqueUsername(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'user');
        
        const newUser: User = {
          id: firebaseUser.uid,
          username,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || username,
          avatar: firebaseUser.photoURL || undefined,
          bio: '',
          joinDate: new Date().toISOString(),
          stats: {
            quotesShared: 0,
            favoriteCount: 0,
            followersCount: 0,
            followingCount: 0,
            totalLikes: 0
          },
          preferences: {
            theme: 'auto',
            language: 'id',
            notifications: {
              newFollowers: true,
              quoteLikes: true,
              newQuotes: true
            },
            privacy: {
              profilePublic: true,
              showStats: true,
              allowMessages: true
            }
          },
          isVerified: false,
          badges: []
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        this.currentUser = newUser;
      } else {
        await this.loadUserProfile(firebaseUser.uid);
      }

      return { success: true, user: this.currentUser! };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  async loginWithGitHub(): Promise<{ success: boolean; user?: User; error?: string }> {
    if (DEMO_MODE) {
      return { success: false, error: 'OAuth tidak tersedia dalam mode demo' };
    }

    if (!githubProvider || !auth) {
      return { success: false, error: 'GitHub provider tidak tersedia' };
    }

    try {
      const result = await signInWithPopup(auth, githubProvider);
      const firebaseUser = result.user;
      
      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile
        const username = await this.generateUniqueUsername(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'user');
        
        const newUser: User = {
          id: firebaseUser.uid,
          username,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || username,
          avatar: firebaseUser.photoURL || undefined,
          bio: '',
          joinDate: new Date().toISOString(),
          stats: {
            quotesShared: 0,
            favoriteCount: 0,
            followersCount: 0,
            followingCount: 0,
            totalLikes: 0
          },
          preferences: {
            theme: 'auto',
            language: 'id',
            notifications: {
              newFollowers: true,
              quoteLikes: true,
              newQuotes: true
            },
            privacy: {
              profilePublic: true,
              showStats: true,
              allowMessages: true
            }
          },
          isVerified: false,
          badges: []
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        this.currentUser = newUser;
      } else {
        await this.loadUserProfile(firebaseUser.uid);
      }

      return { success: true, user: this.currentUser! };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  async setupRecaptcha(elementId: string): Promise<RecaptchaVerifier> {
    if (DEMO_MODE) {
      throw new Error('Phone authentication tidak tersedia dalam mode demo');
    }

    if (!auth) {
      throw new Error('Firebase Auth tidak tersedia');
    }

    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        size: 'normal', // Changed from 'invisible' to 'normal' for better compatibility
        callback: (response: any) => {
          console.log('reCAPTCHA solved:', response);
        },
        'expired-callback': () => {
          console.warn('reCAPTCHA expired, user needs to solve again');
        }
      });

      // Render the reCAPTCHA to check if it's working
      await recaptchaVerifier.render();
      console.log('✅ reCAPTCHA setup successful');
      
      return recaptchaVerifier;
    } catch (error: any) {
      console.error('❌ reCAPTCHA setup failed:', error);
      throw new Error(`reCAPTCHA setup gagal: ${error.message}. Pastikan phone authentication sudah diaktifkan di Firebase Console.`);
    }
  }

  async sendPhoneVerification(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }> {
    if (DEMO_MODE) {
      return { success: false, error: 'Phone authentication tidak tersedia dalam mode demo' };
    }

    if (!auth) {
      return { success: false, error: 'Firebase Auth tidak tersedia' };
    }

    try {
      console.log('📱 Sending phone verification to:', phoneNumber);
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      console.log('✅ Phone verification sent successfully');
      return { success: true, confirmationResult };
    } catch (error: any) {
      console.error('❌ Phone verification failed:', error);
      
      if (error.code === 'auth/billing-not-enabled') {
        return { 
          success: false, 
          error: 'Phone authentication memerlukan billing aktif di Firebase. Gunakan email/Google/GitHub login sebagai alternatif.' 
        };
      }
      
      if (error.code === 'auth/captcha-check-failed') {
        return { 
          success: false, 
          error: 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.' 
        };
      }
      
      if (error.code === 'auth/invalid-phone-number') {
        return { 
          success: false, 
          error: 'Format nomor telepon tidak valid. Gunakan format internasional (contoh: +6281234567890)' 
        };
      }
      
      if (error.code === 'auth/too-many-requests') {
        return { 
          success: false, 
          error: 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.' 
        };
      }
      
      return { 
        success: false, 
        error: `Gagal mengirim kode verifikasi: ${this.getErrorMessage(error.code)}` 
      };
    }
  }

  async verifyPhoneCode(confirmationResult: ConfirmationResult, code: string, userData?: { username: string; displayName: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    if (DEMO_MODE) {
      return { success: false, error: 'Phone authentication tidak tersedia dalam mode demo' };
    }

    try {
      const result = await confirmationResult.confirm(code);
      const firebaseUser = result.user;

      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile for phone authentication
        let username = firebaseUser.phoneNumber?.replace(/[^\d]/g, '') || 'user';
        let displayName = firebaseUser.phoneNumber || 'User';

        // Use provided userData if available (from registration)
        if (userData) {
          username = userData.username;
          displayName = userData.displayName;
        } else {
          // Generate username from phone number
          username = await this.generateUniqueUsername(username);
        }
        
        const newUser: User = {
          id: firebaseUser.uid,
          username,
          email: '',
          displayName,
          avatar: undefined,
          bio: '',
          joinDate: new Date().toISOString(),
          stats: {
            quotesShared: 0,
            favoriteCount: 0,
            followersCount: 0,
            followingCount: 0,
            totalLikes: 0
          },
          preferences: {
            theme: 'auto',
            language: 'id',
            notifications: {
              newFollowers: true,
              quoteLikes: true,
              newQuotes: true
            },
            privacy: {
              profilePublic: true,
              showStats: true,
              allowMessages: true
            }
          },
          isVerified: false,
          badges: []
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        this.currentUser = newUser;
      } else {
        await this.loadUserProfile(firebaseUser.uid);
      }

      return { success: true, user: this.currentUser! };
    } catch (error: any) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  async logout(): Promise<void> {
    if (DEMO_MODE) {
      this.currentUser = null;
      return;
    }

    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async followUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'User tidak login' };
    }

    if (DEMO_MODE) {
      return { success: true };
    }

    try {
      const currentUserRef = doc(db, 'users', this.currentUser.id);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Add to following list
      await updateDoc(currentUserRef, {
        following: arrayUnion(targetUserId)
      });

      // Add to followers list
      await updateDoc(targetUserRef, {
        followers: arrayUnion(this.currentUser.id)
      });

      // Create notification
      await this.createNotification({
        userId: targetUserId,
        type: 'follow',
        title: 'Pengikut Baru',
        message: `${this.currentUser.displayName} mulai mengikuti Anda`,
        read: false,
        createdAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Gagal mengikuti pengguna' };
    }
  }

  async unfollowUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'User tidak login' };
    }

    if (DEMO_MODE) {
      return { success: true };
    }

    try {
      const currentUserRef = doc(db, 'users', this.currentUser.id);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Remove from following list
      await updateDoc(currentUserRef, {
        following: arrayRemove(targetUserId)
      });

      // Remove from followers list
      await updateDoc(targetUserRef, {
        followers: arrayRemove(this.currentUser.id)
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Gagal berhenti mengikuti pengguna' };
    }
  }

  async createNotification(notification: Omit<Notification, 'id'>): Promise<void> {
    if (DEMO_MODE) return;

    try {
      const notificationRef = doc(collection(db, 'notifications'));
      await setDoc(notificationRef, {
        ...notification,
        id: notificationRef.id,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    if (DEMO_MODE) return [];

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Notification);
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    if (DEMO_MODE) return true;

    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    if (DEMO_MODE) {
      return {
        id: userId,
        username: 'demo_user',
        email: 'demo@example.com',
        displayName: 'Demo User',
        joinDate: new Date().toISOString(),
        stats: {
          quotesShared: 5,
          favoriteCount: 12,
          followersCount: 8,
          followingCount: 15,
          totalLikes: 42
        },
        preferences: {
          theme: 'auto',
          language: 'id',
          notifications: {
            newFollowers: true,
            quoteLikes: true,
            newQuotes: true
          },
          privacy: {
            profilePublic: true,
            showStats: true,
            allowMessages: true
          }
        },
        isVerified: false,
        badges: []
      };
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() as User : null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  private async loadUserProfile(uid: string): Promise<void> {
    try {
      if (!db) {
        console.warn('Database not available, skipping profile load');
        return;
      }
      
      // First try normal Firestore with shorter timeout
      try {
        console.log('📱 Attempting to load profile via Firestore...');
        const profilePromise = getDoc(doc(db, 'users', uid));
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firestore timeout')), 5000)
        );
        
        const userDoc = await Promise.race([profilePromise, timeoutPromise]) as any;
        
        if (userDoc.exists()) {
          this.currentUser = userDoc.data() as User;
          console.log('✅ User profile loaded via Firestore');
          return;
        }
      } catch (firestoreError: any) {
        console.log('⚠️ Firestore failed, trying REST API fallback:', firestoreError?.message);
        
        // Fallback to REST API
        try {
          const { firebaseRestClient } = await import('./firebaseRestApi');
          const userData = await firebaseRestClient.getDocument('users', uid);
          
          if (userData) {
            this.currentUser = userData as User;
            console.log('✅ User profile loaded via REST API');
            return;
          } else {
            console.log('� User profile not found, creating default profile');
            await this.createDefaultUserProfile(uid);
            return;
          }
        } catch (restError: any) {
          console.warn('⚠️ REST API also failed:', restError?.message);
        }
      }
      
      // If both methods fail, create default profile
      console.log('📄 Creating default profile due to connection issues');
      await this.createDefaultUserProfile(uid);
      
    } catch (error: any) {
      console.log('❌ Critical error in loadUserProfile:', error?.message || error);
      
      // Last resort: create minimal profile
      this.currentUser = {
        id: uid,
        username: `user_${uid.slice(0, 8)}`,
        email: auth?.currentUser?.email || '',
        displayName: auth?.currentUser?.displayName || 'User',
        joinDate: new Date().toISOString(),
        stats: { quotesShared: 0, favoriteCount: 0, followersCount: 0, followingCount: 0, totalLikes: 0 },
        preferences: {
          theme: 'light' as const,
          language: 'en' as const,
          notifications: { newFollowers: true, quoteLikes: true, newQuotes: true },
          privacy: { profilePublic: true, showStats: true, allowMessages: true }
        },
        isVerified: false,
        badges: []
      };
      console.log('🚑 Created emergency fallback profile');
    }
  }

  private async createDefaultUserProfile(uid: string): Promise<void> {
    try {
      if (!auth?.currentUser) return;
      
      const defaultProfile: Partial<User> = {
        id: uid,
        email: auth.currentUser.email || '',
        username: auth.currentUser.displayName || `user_${uid.slice(0, 8)}`,
        displayName: auth.currentUser.displayName || 'Anonymous User',
        avatar: auth.currentUser.photoURL || '',
        bio: '',
        joinDate: new Date().toISOString(),
        stats: {
          quotesShared: 0,
          favoriteCount: 0,
          followersCount: 0,
          followingCount: 0,
          totalLikes: 0
        },
        preferences: {
          theme: 'light' as const,
          language: 'en' as const,
          notifications: {
            newFollowers: true,
            quoteLikes: true,
            newQuotes: true
          },
          privacy: {
            profilePublic: true,
            showStats: true,
            allowMessages: true
          }
        },
        isVerified: false,
        badges: []
      };

      // Try Firestore first
      if (db) {
        try {
          await setDoc(doc(db, 'users', uid), defaultProfile, { merge: true });
          console.log('✅ Default user profile created via Firestore');
        } catch (firestoreError) {
          console.log('⚠️ Firestore failed, trying REST API for profile creation');
          
          // Fallback to REST API
          try {
            const { firebaseRestClient } = await import('./firebaseRestApi');
            await firebaseRestClient.setDocument('users', uid, defaultProfile, true);
            console.log('✅ Default user profile created via REST API');
          } catch (restError) {
            console.warn('⚠️ Both Firestore and REST failed for profile creation:', restError);
          }
        }
      }
      
      // Set in memory regardless of storage success
      this.currentUser = defaultProfile as User;
      console.log('📱 Default profile set in memory');
      
    } catch (error) {
      console.warn('❌ Failed to create default profile:', error);
      
      // Emergency fallback - at least set something in memory
      this.currentUser = {
        id: uid,
        username: `user_${uid.slice(0, 8)}`,
        email: auth?.currentUser?.email || '',
        displayName: 'User',
        joinDate: new Date().toISOString(),
        stats: { quotesShared: 0, favoriteCount: 0, followersCount: 0, followingCount: 0, totalLikes: 0 },
        preferences: {
          theme: 'light' as const,
          language: 'en' as const,
          notifications: { newFollowers: true, quoteLikes: true, newQuotes: true },
          privacy: { profilePublic: true, showStats: true, allowMessages: true }
        },
        isVerified: false,
        badges: []
      };
    }
  }

  private async checkUsernameExists(username: string): Promise<boolean> {
    try {
      if (!db) {
        console.warn('Database not available, skipping username check');
        return false;
      }
      
      const q = query(
        collection(db, 'users'),
        where('username', '==', username),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error: any) {
      console.error('Failed to check username:', error);
      
      // Handle offline errors
      if (error?.code === 'failed-precondition' || 
          error?.message?.includes('offline') || 
          error?.message?.includes('client is offline')) {
        console.warn('🔄 Client is offline, username check skipped');
        return false;
      }
      
      return false;
    }
  }

  private async generateUniqueUsername(baseName: string): Promise<string> {
    // Clean the base name (remove spaces, special chars, etc.)
    let cleanBase = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);
    
    if (!cleanBase) cleanBase = 'user';
    
    // Try the base name first
    if (!(await this.checkUsernameExists(cleanBase))) {
      return cleanBase;
    }
    
    // If taken, try with numbers
    for (let i = 1; i <= 999; i++) {
      const candidate = `${cleanBase}${i}`;
      if (!(await this.checkUsernameExists(candidate))) {
        return candidate;
      }
    }
    
    // Fallback: use timestamp
    return `${cleanBase}${Date.now()}`.substring(0, 20);
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Email sudah terdaftar';
      case 'auth/invalid-email':
        return 'Format email tidak valid';
      case 'auth/weak-password':
        return 'Password terlalu lemah (minimal 6 karakter)';
      case 'auth/user-not-found':
        return 'Email tidak terdaftar';
      case 'auth/wrong-password':
        return 'Password salah';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan login. Coba lagi nanti';
      default:
        return 'Terjadi kesalahan. Silakan coba lagi';
    }
  }

  // Demo methods for development without Firebase
  private demoRegister(userData: any): { success: boolean; user?: User; error?: string } {
    const demoUser: User = {
      id: 'demo_' + Date.now(),
      username: userData.username,
      email: userData.email,
      displayName: userData.displayName,
      joinDate: new Date().toISOString(),
      stats: {
        quotesShared: 0,
        favoriteCount: 0,
        followersCount: 0,
        followingCount: 0,
        totalLikes: 0
      },
      preferences: {
        theme: 'auto',
        language: 'id',
        notifications: {
          newFollowers: true,
          quoteLikes: true,
          newQuotes: true
        },
        privacy: {
          profilePublic: true,
          showStats: true,
          allowMessages: true
        }
      },
      isVerified: false,
      badges: []
    };

    this.currentUser = demoUser;
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    return { success: true, user: demoUser };
  }

  private demoLogin(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const savedUser = localStorage.getItem('demo_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      return { success: true, user: this.currentUser || undefined };
    }

    // Default demo user
    const demoUser: User = {
      id: 'demo_user_1',
      username: 'demo',
      email: email,
      displayName: 'Demo User',
      joinDate: new Date().toISOString(),
      stats: {
        quotesShared: 3,
        favoriteCount: 8,
        followersCount: 12,
        followingCount: 5,
        totalLikes: 25
      },
      preferences: {
        theme: 'auto',
        language: 'id',
        notifications: {
          newFollowers: true,
          quoteLikes: true,
          newQuotes: true
        },
        privacy: {
          profilePublic: true,
          showStats: true,
          allowMessages: true
        }
      },
      isVerified: false,
      badges: []
    };

    this.currentUser = demoUser;
    return { success: true, user: demoUser };
  }

  async getFollowers(userId: string): Promise<User[]> {
    if (DEMO_MODE) {
      // Return demo followers
      return [
        {
          id: 'demo_follower_1',
          username: 'follower1',
          email: 'follower1@demo.com',
          displayName: 'Demo Follower 1',
          joinDate: new Date().toISOString(),
          stats: { quotesShared: 1, favoriteCount: 2, followersCount: 3, followingCount: 4, totalLikes: 5 },
          preferences: { theme: 'auto', language: 'id', notifications: { newFollowers: true, quoteLikes: true, newQuotes: true }, privacy: { profilePublic: true, showStats: true, allowMessages: true } },
          isVerified: false,
          badges: []
        }
      ];
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];

      const userData = userDoc.data();
      const followerIds = userData.followers || [];

      if (followerIds.length === 0) return [];

      const followerPromises = followerIds.map((id: string) => this.getUserById(id));
      const followers = await Promise.all(followerPromises);
      return followers.filter((user): user is User => user !== null);
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  }

  async getFollowing(userId: string): Promise<User[]> {
    if (DEMO_MODE) {
      // Return demo following
      return [
        {
          id: 'demo_following_1',
          username: 'following1',
          email: 'following1@demo.com',
          displayName: 'Demo Following 1',
          joinDate: new Date().toISOString(),
          stats: { quotesShared: 2, favoriteCount: 3, followersCount: 4, followingCount: 5, totalLikes: 6 },
          preferences: { theme: 'auto', language: 'id', notifications: { newFollowers: true, quoteLikes: true, newQuotes: true }, privacy: { profilePublic: true, showStats: true, allowMessages: true } },
          isVerified: false,
          badges: []
        }
      ];
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];

      const userData = userDoc.data();
      const followingIds = userData.following || [];

      if (followingIds.length === 0) return [];

      const followingPromises = followingIds.map((id: string) => this.getUserById(id));
      const following = await Promise.all(followingPromises);
      return following.filter((user): user is User => user !== null);
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  }

  async isFollowing(userId: string, targetUserId: string): Promise<boolean> {
    if (DEMO_MODE) {
      return false; // Default demo behavior
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return false;

      const userData = userDoc.data();
      const following = userData.following || [];
      return following.includes(targetUserId);
    } catch (error) {
      console.error('Error checking if following:', error);
      return false;
    }
  }

  destroy(): void {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  }
}

export const firebaseUserService = new FirebaseUserService();
export default firebaseUserService;
