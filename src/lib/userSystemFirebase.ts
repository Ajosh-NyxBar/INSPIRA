/**
 * User System Integration with Firebase
 * Wraps Firebase services for easier usage
 */

import { firebaseUserService } from './firebaseUserService';
import { User, Notification } from '@/types/phase3';

export class UserSystem {
  static async register(userData: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    return firebaseUserService.register(userData);
  }

  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return firebaseUserService.login(email, password);
  }

  static async logout(): Promise<void> {
    return firebaseUserService.logout();
  }

  static getCurrentUser(): User | null {
    return firebaseUserService.getCurrentUser();
  }

  static async followUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
    return firebaseUserService.followUser(targetUserId);
  }

  static async unfollowUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
    return firebaseUserService.unfollowUser(targetUserId);
  }

  static async getUserById(userId: string): Promise<User | null> {
    return firebaseUserService.getUserById(userId);
  }

  static getAllNotifications(): Notification[] {
    // For compatibility with existing code - returns empty array
    // Real notifications should be fetched via getNotifications
    return [];
  }

  static async getNotifications(userId: string): Promise<Notification[]> {
    return firebaseUserService.getNotifications(userId);
  }

  static async markNotificationRead(notificationId: string): Promise<boolean> {
    return firebaseUserService.markNotificationRead(notificationId);
  }

  static async createNotification(notification: Omit<Notification, 'id'>): Promise<void> {
    return firebaseUserService.createNotification(notification);
  }
}
