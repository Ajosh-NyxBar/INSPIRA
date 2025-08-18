/**
 * Navigation Component
 * Header navigation dengan menu untuk berbagai halaman dan fitur sosial
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiHome, HiHeart, HiBookOpen, HiTag, HiSparkles, 
  HiPencilAlt, HiChartBar, HiStar, HiSearch, 
  HiMenu, HiX, HiUser, HiLogout
} from 'react-icons/hi';
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
      icon: HiHome,
      description: 'Quote random inspiratif'
    },
    {
      id: 'favorites' as const,
      label: 'Favorit',
      icon: HiHeart,
      description: 'Quote tersimpan',
      badge: favoritesCount > 0 ? favoritesCount : undefined
    },
    {
      id: 'history' as const,
      label: 'Riwayat',
      icon: HiBookOpen,
      description: 'Quote yang pernah dibaca',
      badge: historyCount > 0 ? Math.min(historyCount, 99) : undefined
    },
    {
      id: 'categories' as const,
      label: 'Kategori',
      icon: HiTag,
      description: 'Filter berdasarkan topik'
    }
  ];

  const socialMenuItems = [
    {
      id: 'community' as const,
      label: 'Komunitas',
      icon: HiSparkles,
      description: 'Feed sosial quotes',
      badge: undefined
    },
    {
      id: 'create' as const,
      label: 'Buat Quote',
      icon: HiPencilAlt,
      description: 'Tulis quote inspiratif',
      badge: undefined
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: HiChartBar,
      description: 'Insights & statistik',
      badge: undefined
    }
  ];

  const premiumMenuItems = [
    {
      id: 'premium' as const,
      label: userTier === 'free' ? 'Upgrade Premium' : 'Premium Dashboard',
      icon: userTier === 'free' ? HiStar : HiStar,
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
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => handlePageChange('home')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-2xl">💡</span>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  InspirasiHub
                </span>
              </button>
            </motion.div>

            {/* Desktop Menu - Hidden on smaller screens */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.slice(0, 4).map((item) => {
                const IconComponent = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative px-4 py-2 rounded-xl font-medium transition-all duration-300
                      ${currentPage === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                      }
                      ${(item as any).isPremium && userTier === 'free' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600' : ''}
                    `}
                  >
                    <span className="flex items-center space-x-2">
                      <IconComponent className="w-5 h-5" />
                      <span className="hidden xl:block">{item.label}</span>
                    </span>
                    {item.badge && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
              
              {/* AI Search Button */}
              {currentUser && onAISearchOpen && (
                <motion.button
                  onClick={onAISearchOpen}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    userTier === 'free' 
                      ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' 
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                  title={userTier === 'free' ? 'Upgrade premium untuk AI Search' : 'AI Search'}
                >
                  <span className="flex items-center space-x-2">
                    <HiSearch className="w-5 h-5" />
                    <span className="hidden xl:block">AI Search</span>
                    {userTier === 'free' && <span className="text-xs">🔒</span>}
                  </span>
                </motion.button>
              )}
            </div>

            {/* User Menu & Burger Button */}
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
                  <motion.button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {currentUser.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-gray-700 dark:text-gray-300">
                      {currentUser.displayName}
                    </span>
                    <motion.svg 
                      className="w-4 h-4 text-gray-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ rotate: showUserMenu ? 180 : 0 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-50"
                        >
                          <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50">
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {currentUser.displayName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              @{currentUser.username}
                            </p>
                          </div>
                          <div className="py-2">
                            <motion.button
                              onClick={() => {
                                handlePageChange('profile');
                                setShowUserMenu(false);
                              }}
                              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                              className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 transition-colors flex items-center space-x-2"
                            >
                              <HiUser className="w-4 h-4" />
                              <span>Profil</span>
                            </motion.button>
                            <motion.button
                              onClick={() => {
                                handlePageChange('create');
                                setShowUserMenu(false);
                              }}
                              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                              className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 transition-colors flex items-center space-x-2"
                            >
                              <HiPencilAlt className="w-4 h-4" />
                              <span>Buat Quote</span>
                            </motion.button>
                            <hr className="my-2 border-gray-200/50 dark:border-gray-700/50" />
                            <motion.button
                              onClick={handleLogout}
                              whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                              className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 transition-colors flex items-center space-x-2"
                            >
                              <HiLogout className="w-4 h-4" />
                              <span>Keluar</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  onClick={() => setShowAuthModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg"
                >
                  Masuk
                </motion.button>
              )}

              {/* Burger Menu Button */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMenuOpen ? (
                    <HiX className="w-6 h-6" />
                  ) : (
                    <HiMenu className="w-6 h-6" />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Burger Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-l border-gray-200/50 dark:border-gray-700/50 z-50 lg:hidden"
              >
                <div className="p-6">
                  {/* Menu Header */}
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Menu
                    </h2>
                    <motion.button
                      onClick={() => setIsMenuOpen(false)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-xl text-gray-500 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                    >
                      <HiX className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-2">
                    {menuItems.map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => handlePageChange(item.id)}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            w-full text-left p-4 rounded-xl transition-all duration-300 relative group
                            ${currentPage === item.id
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-gray-200'
                            }
                            ${(item as any).isPremium && userTier === 'free' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : ''}
                          `}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${currentPage === item.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'}`}>
                              <IconComponent className={`w-5 h-5 ${currentPage === item.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{item.label}</div>
                              <div className={`text-sm opacity-75 ${currentPage === item.id ? 'text-white/80' : ''}`}>
                                {item.description}
                              </div>
                            </div>
                            {item.badge && (
                              <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold"
                              >
                                {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                              </motion.span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                    
                    {/* AI Search in Mobile Menu */}
                    {currentUser && onAISearchOpen && (
                      <motion.button
                        onClick={() => {
                          onAISearchOpen();
                          setIsMenuOpen(false);
                        }}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: menuItems.length * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                          userTier === 'free' 
                            ? 'text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50' 
                            : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                        title={userTier === 'free' ? 'Upgrade premium untuk AI Search' : 'AI Search'}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700">
                            <HiSearch className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium flex items-center space-x-2">
                              <span>AI Search</span>
                              {userTier === 'free' && <span className="text-xs">🔒</span>}
                            </div>
                            <div className="text-sm opacity-75">
                              {userTier === 'free' ? 'Upgrade untuk menggunakan' : 'Pencarian cerdas AI'}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )}
                  </div>
                  
                  {/* Mobile Auth Section */}
                  {!currentUser && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50"
                    >
                      <motion.button
                        onClick={() => {
                          setShowAuthModal(true);
                          setIsMenuOpen(false);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg"
                      >
                        Masuk / Daftar
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}
