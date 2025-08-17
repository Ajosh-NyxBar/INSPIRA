/**
 * Firebase User Service
 * Handles user authentication and user data with Firebase
 */

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
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
import { auth, db } from './firebase';
import { User, Notification } from '@/types/phase3';

// Demo mode for development without Firebase setup
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

class FirebaseUserService {
  private currentUser: User | null = null;
  private authUnsubscribe: (() => void) | null = null;

  constructor() {
    if (!DEMO_MODE) {
      this.initializeAuth();
    }
  }

  private initializeAuth() {
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
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        this.currentUser = userDoc.data() as User;
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  private async checkUsernameExists(username: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'users'),
        where('username', '==', username),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Failed to check username:', error);
      return false;
    }
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
