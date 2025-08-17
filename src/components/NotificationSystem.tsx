/**
 * Notification System Component
 * Handles real-time notifications for user interactions
 */

'use client';

import { useState, useEffect } from 'react';
import { UserSystem } from '@/lib/userSystem';
import { Notification, User } from '@/types/phase3';

interface NotificationSystemProps {
  currentUser: User | null;
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationSystem({ currentUser, onNotificationClick }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load notifications
  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [currentUser]);

  const loadNotifications = () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const userNotifications = UserSystem.getAllNotifications().filter(n => n.userId === currentUser.id);
      setNotifications(userNotifications);
      
      const unread = userNotifications.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!currentUser) return;
    
    const result = await UserSystem.markNotificationRead(notificationId);
    if (result) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = () => {
    if (!currentUser) return;
    
    const unreadNotifications = notifications.filter((n: Notification) => !n.read);
    unreadNotifications.forEach(notification => {
      UserSystem.markNotificationRead(notification.id);
    });
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}j`;
    return `${days}h`;
  };

  const getNotificationIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'quote_approved': return '✅';
      case 'mention': return '@';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: Notification['type']): string => {
    switch (type) {
      case 'like': return 'text-red-500';
      case 'comment': return 'text-blue-500';
      case 'follow': return 'text-green-500';
      case 'quote_approved': return 'text-purple-500';
      case 'mention': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-3.405-3.405A5.982 5.982 0 0118 9.75V9A6 6 0 006 9v.75a5.982 5.982 0 011.405 5.595L4 19h5m6-2v1a3 3 0 11-6 0v-1m6-2H9" />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Notifikasi
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {unreadCount} notifikasi belum dibaca
                </p>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-3 mb-4 last:mb-0 animate-pulse">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-3">🔔</div>
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    Belum ada notifikasi
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notifikasi akan muncul di sini ketika ada aktivitas baru
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700
                        ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      `}
                    >
                      <div className="flex space-x-3">
                        {/* Icon */}
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-lg
                          ${!notification.read ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'}
                        `}>
                          <span className={getNotificationColor(notification.type)}>
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`
                            text-sm leading-5
                            ${!notification.read 
                              ? 'text-gray-900 dark:text-white font-medium' 
                              : 'text-gray-700 dark:text-gray-300'
                            }
                          `}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors py-2"
                >
                  Lihat semua notifikasi
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Notification Badge Component (can be used separately)
export function NotificationBadge({ currentUser }: { currentUser: User | null }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const notifications = UserSystem.getAllNotifications().filter(n => n.userId === currentUser.id);
      const unread = notifications.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    } else {
      setUnreadCount(0);
    }
  }, [currentUser]);

  if (!currentUser || unreadCount === 0) return null;

  return (
    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
