/**
 * Navigation Component
 * Header navigation dengan menu untuk berbagai halaman dan fitur sosial
 */

'use client';

import { useState, useEffect } from 'react';
import { getFavoritesCount, getHistory, getUsageStats } from '@/lib/localStorage';
import { UserSystem } from '@/lib/userSystem';
import { User } from '@/types/phase3';
import NotificationSystem from './NotificationSystem';
import AuthModal from './AuthModal';

interface NavigationProps {
  currentPage: 'home' | 'favorites' | 'history' | 'categories' | 'community' | 'profile' | 'create' | 'analytics' | 'premium';
  onPageChange: (page: 'home' | 'favorites' | 'history' | 'categories' | 'community' | 'profile' | 'create' | 'analytics' | 'premium') => void;
  onAISearchOpen?: () => void;
}

export default function Navigation({ currentPage, onPageChange, onAISearchOpen }: NavigationProps) {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'premium' | 'pro'>('free');

  useEffect(() => {
    // Update counts
    setFavoritesCount(getFavoritesCount());
    setHistoryCount(getHistory().length);
    
    // Check for logged in user
    setCurrentUser(UserSystem.getCurrentUser());
  }, [currentPage]);

  const publicMenuItems = [
    {
      id: 'home' as const,
      label: 'Beranda',
      icon: '🏠',
      description: 'Quote random inspiratif'
    },
    {
      id: 'favorites' as const,
      label: 'Favorit',
      icon: '❤️',
      description: 'Quote tersimpan',
      badge: favoritesCount > 0 ? favoritesCount : undefined
    },
    {
      id: 'history' as const,
      label: 'Riwayat',
      icon: '📚',
      description: 'Quote yang pernah dibaca',
      badge: historyCount > 0 ? Math.min(historyCount, 99) : undefined
    },
    {
      id: 'categories' as const,
      label: 'Kategori',
      icon: '🏷️',
      description: 'Filter berdasarkan topik'
    }
  ];

  const socialMenuItems = [
    {
      id: 'community' as const,
      label: 'Komunitas',
      icon: '🌟',
      description: 'Feed sosial quotes',
      badge: undefined
    },
    {
      id: 'create' as const,
      label: 'Buat Quote',
      icon: '✍️',
      description: 'Tulis quote inspiratif',
      badge: undefined
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: '📊',
      description: 'Insights & statistik',
      badge: undefined
    }
  ];

  const premiumMenuItems = [
    {
      id: 'premium' as const,
      label: userTier === 'free' ? 'Upgrade Premium' : 'Premium Dashboard',
      icon: userTier === 'free' ? '⭐' : '💎',
      description: userTier === 'free' ? 'Unlock fitur premium' : 'Kelola subscription',
      badge: userTier === 'free' ? 'NEW' : undefined,
      isPremium: true
    }
  ];

  const menuItems = currentUser 
    ? [...publicMenuItems, ...socialMenuItems, ...premiumMenuItems] 
    : [...publicMenuItems, ...premiumMenuItems];

  const handlePageChange = (page: typeof currentPage) => {
    // Redirect to auth if trying to access social features without login
    if (!currentUser && ['community', 'create', 'profile', 'analytics'].includes(page)) {
      setShowAuthModal(true);
      return;
    }
    
    onPageChange(page);
    setIsMenuOpen(false);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    UserSystem.logout();
    setCurrentUser(null);
    setShowUserMenu(false);
    // Redirect to home if on social pages
    if (['community', 'create', 'profile'].includes(currentPage)) {
      onPageChange('home');
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => handlePageChange('home')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-2xl">💡</span>
                <span className="text-xl font-bold text-gray-800 dark:text-white">
                  InspirasiHub
                </span>
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`
                    relative px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${currentPage === item.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                    ${(item as any).isPremium && userTier === 'free' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600' : ''}
                  `}
                >
                  <span className="flex items-center space-x-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              ))}
              
              {/* AI Search Button */}
              {currentUser && onAISearchOpen && (
                <button
                  onClick={onAISearchOpen}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    userTier === 'free' 
                      ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' 
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                  title={userTier === 'free' ? 'Upgrade premium untuk AI Search' : 'AI Search'}
                >
                  <span className="flex items-center space-x-2">
                    <span>🔍</span>
                    <span>AI Search</span>
                    {userTier === 'free' && <span className="text-xs">🔒</span>}
                  </span>
                </button>
              )}
            </div>

            {/* User Menu & Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications (only for logged in users) */}
              {currentUser && (
                <NotificationSystem 
                  currentUser={currentUser}
                  onNotificationClick={() => {}} 
                />
              )}

              {/* User Profile or Login */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {currentUser.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-gray-700 dark:text-gray-300">
                      {currentUser.displayName}
                    </span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {currentUser.displayName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            @{currentUser.username}
                          </p>
                        </div>
                        <div className="py-2">
                          <button
                            onClick={() => {
                              handlePageChange('profile');
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            👤 Profil
                          </button>
                          <button
                            onClick={() => {
                              handlePageChange('create');
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            ✍️ Buat Quote
                          </button>
                          <hr className="my-2 border-gray-200 dark:border-gray-700" />
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            🚪 Keluar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Masuk
                </button>
              )}

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg transition-colors relative
                    ${currentPage === item.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm opacity-75">{item.description}</div>
                    </div>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                </button>
              ))}
              
              {/* Mobile Auth Section */}
              {!currentUser && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Masuk / Daftar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
}
