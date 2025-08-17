/**
 * User System for InspirasiHub Phase 3
 * Simulated authentication and user management using localStorage
 */

import { User, Follow, Notification, PHASE3_STORAGE_KEYS } from '@/types/phase3';

// Utility functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function safeSaveJSON(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

export class UserSystem {
  /**
   * Register new user
   */
  static async register(userData: {
    username: string;
    email: string;
    displayName: string;
    password: string; // In real app, this would be hashed
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const users = this.getAllUsers();
      
      // Check if username or email already exists
      if (users.some(u => u.username === userData.username)) {
        return { success: false, error: 'Username sudah digunakan' };
      }
      
      if (users.some(u => u.email === userData.email)) {
        return { success: false, error: 'Email sudah terdaftar' };
      }
      
      // Create new user
      const newUser: User = {
        id: generateId(),
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        bio: `Halo! Saya ${userData.displayName}, suka berbagi inspirasi di InspirasiHub.`,
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
        badges: ['new-member']
      };
      
      // Save user
      users.push(newUser);
      safeSaveJSON(PHASE3_STORAGE_KEYS.USERS, users);
      
      // Auto login after registration
      this.setCurrentUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: 'Gagal mendaftar. Silakan coba lagi.' };
    }
  }
  
  /**
   * Login user
   */
  static async login(credential: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const users = this.getAllUsers();
      
      // Find user by username or email
      const user = users.find(u => 
        u.username === credential || u.email === credential
      );
      
      if (!user) {
        return { success: false, error: 'Username/email tidak ditemukan' };
      }
      
      // In real app, verify password hash here
      // For demo, we'll just simulate successful login
      
      this.setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Gagal login. Silakan coba lagi.' };
    }
  }
  
  /**
   * Logout current user
   */
  static logout(): void {
    localStorage.removeItem(PHASE3_STORAGE_KEYS.CURRENT_USER);
  }
  
  /**
   * Get current logged in user
   */
  static getCurrentUser(): User | null {
    const stored = localStorage.getItem(PHASE3_STORAGE_KEYS.CURRENT_USER);
    return safeParseJSON(stored, null);
  }
  
  /**
   * Set current user
   */
  static setCurrentUser(user: User): void {
    safeSaveJSON(PHASE3_STORAGE_KEYS.CURRENT_USER, user);
  }
  
  /**
   * Update user profile
   */
  static updateProfile(userId: string, updates: Partial<User>): boolean {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    // Update user
    users[userIndex] = { ...users[userIndex], ...updates };
    const success = safeSaveJSON(PHASE3_STORAGE_KEYS.USERS, users);
    
    // Update current user if it's the same user
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      this.setCurrentUser(users[userIndex]);
    }
    
    return success;
  }
  
  /**
   * Get all users
   */
  static getAllUsers(): User[] {
    const stored = localStorage.getItem(PHASE3_STORAGE_KEYS.USERS);
    return safeParseJSON(stored, []);
  }
  
  /**
   * Get user by ID
   */
  static getUserById(userId: string): User | null {
    const users = this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  }
  
  /**
   * Search users
   */
  static searchUsers(query: string, limit: number = 10): User[] {
    const users = this.getAllUsers();
    const lowercaseQuery = query.toLowerCase();
    
    return users
      .filter(user => 
        user.username.toLowerCase().includes(lowercaseQuery) ||
        user.displayName.toLowerCase().includes(lowercaseQuery) ||
        user.bio?.toLowerCase().includes(lowercaseQuery)
      )
      .slice(0, limit);
  }
  
  // =============================================================================
  // FOLLOW SYSTEM
  // =============================================================================
  
  /**
   * Follow a user
   */
  static followUser(followerId: string, followingId: string): boolean {
    if (followerId === followingId) return false;
    
    const follows = this.getAllFollows();
    
    // Check if already following
    if (follows.some(f => f.followerId === followerId && f.followingId === followingId)) {
      return false;
    }
    
    // Add follow relationship
    const newFollow: Follow = {
      id: generateId(),
      followerId,
      followingId,
      createdAt: new Date().toISOString()
    };
    
    follows.push(newFollow);
    safeSaveJSON(PHASE3_STORAGE_KEYS.FOLLOWS, follows);
    
    // Update user stats
    this.updateUserStats(followerId, { followingCount: 1 });
    this.updateUserStats(followingId, { followersCount: 1 });
    
    // Create notification
    this.createNotification(followingId, {
      type: 'follow',
      title: 'Follower Baru!',
      message: `${this.getUserById(followerId)?.displayName} mulai mengikuti Anda`,
      data: { followerId }
    });
    
    return true;
  }
  
  /**
   * Unfollow a user
   */
  static unfollowUser(followerId: string, followingId: string): boolean {
    const follows = this.getAllFollows();
    const followIndex = follows.findIndex(f => 
      f.followerId === followerId && f.followingId === followingId
    );
    
    if (followIndex === -1) return false;
    
    // Remove follow relationship
    follows.splice(followIndex, 1);
    safeSaveJSON(PHASE3_STORAGE_KEYS.FOLLOWS, follows);
    
    // Update user stats
    this.updateUserStats(followerId, { followingCount: -1 });
    this.updateUserStats(followingId, { followersCount: -1 });
    
    return true;
  }
  
  /**
   * Check if user is following another user
   */
  static isFollowing(followerId: string, followingId: string): boolean {
    const follows = this.getAllFollows();
    return follows.some(f => f.followerId === followerId && f.followingId === followingId);
  }
  
  /**
   * Get user followers
   */
  static getFollowers(userId: string): User[] {
    const follows = this.getAllFollows();
    const followerIds = follows
      .filter(f => f.followingId === userId)
      .map(f => f.followerId);
    
    return followerIds
      .map(id => this.getUserById(id))
      .filter((user): user is User => user !== null);
  }
  
  /**
   * Get users that a user is following
   */
  static getFollowing(userId: string): User[] {
    const follows = this.getAllFollows();
    const followingIds = follows
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);
    
    return followingIds
      .map(id => this.getUserById(id))
      .filter((user): user is User => user !== null);
  }
  
  /**
   * Get all follows
   */
  static getAllFollows(): Follow[] {
    const stored = localStorage.getItem(PHASE3_STORAGE_KEYS.FOLLOWS);
    return safeParseJSON(stored, []);
  }
  
  // =============================================================================
  // NOTIFICATIONS
  // =============================================================================
  
  /**
   * Create notification
   */
  static createNotification(userId: string, notificationData: {
    type: Notification['type'];
    title: string;
    message: string;
    data?: any;
  }): void {
    const notifications = this.getAllNotifications();
    
    const notification: Notification = {
      id: generateId(),
      userId,
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    notifications.push(notification);
    safeSaveJSON(PHASE3_STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
  
  /**
   * Get user notifications
   */
  static getUserNotifications(userId: string, limit: number = 20): Notification[] {
    const notifications = this.getAllNotifications();
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  
  /**
   * Mark notification as read
   */
  static markNotificationRead(notificationId: string): boolean {
    const notifications = this.getAllNotifications();
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) return false;
    
    notifications[notificationIndex].read = true;
    return safeSaveJSON(PHASE3_STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
  
  /**
   * Mark all notifications as read for user
   */
  static markAllNotificationsRead(userId: string): boolean {
    const notifications = this.getAllNotifications();
    let hasChanges = false;
    
    notifications.forEach(notification => {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
        hasChanges = true;
      }
    });
    
    return hasChanges ? safeSaveJSON(PHASE3_STORAGE_KEYS.NOTIFICATIONS, notifications) : true;
  }
  
  /**
   * Get all notifications
   */
  static getAllNotifications(): Notification[] {
    const stored = localStorage.getItem(PHASE3_STORAGE_KEYS.NOTIFICATIONS);
    return safeParseJSON(stored, []);
  }
  
  /**
   * Get unread notification count
   */
  static getUnreadNotificationCount(userId: string): number {
    const notifications = this.getUserNotifications(userId);
    return notifications.filter(n => !n.read).length;
  }
  
  // =============================================================================
  // HELPER METHODS
  // =============================================================================
  
  /**
   * Update user stats
   */
  private static updateUserStats(userId: string, statChanges: Partial<User['stats']>): void {
    const user = this.getUserById(userId);
    if (!user) return;
    
    const updatedStats = { ...user.stats };
    
    Object.entries(statChanges).forEach(([key, value]) => {
      if (typeof value === 'number') {
        (updatedStats as any)[key] = Math.max(0, (updatedStats as any)[key] + value);
      }
    });
    
    this.updateProfile(userId, { stats: updatedStats });
  }
  
  /**
   * Initialize demo users (for development)
   */
  static initializeDemoUsers(): void {
    const users = this.getAllUsers();
    
    if (users.length === 0) {
      const demoUsers: User[] = [
        {
          id: 'demo-user-1',
          username: 'inspirator',
          email: 'inspirator@inspirasihub.com',
          displayName: 'Inspirator Utama',
          bio: 'Berbagi inspirasi adalah passion saya. Setiap hari adalah kesempatan baru!',
          joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          stats: { quotesShared: 25, favoriteCount: 12, followersCount: 156, followingCount: 43, totalLikes: 892 },
          preferences: {
            theme: 'auto', language: 'id',
            notifications: { newFollowers: true, quoteLikes: true, newQuotes: true },
            privacy: { profilePublic: true, showStats: true, allowMessages: true }
          },
          isVerified: true,
          badges: ['verified', 'top-contributor', 'early-adopter']
        }
      ];
      
      safeSaveJSON(PHASE3_STORAGE_KEYS.USERS, demoUsers);
    }
  }
}
