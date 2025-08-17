/**
 * Navigation Component
 * Header navigation dengan menu untuk berbagai halaman
 */

'use client';

import { useState, useEffect } from 'react';
import { getFavoritesCount, getHistory, getUsageStats } from '@/lib/localStorage';

interface NavigationProps {
  currentPage: 'home' | 'favorites' | 'history' | 'categories';
  onPageChange: (page: 'home' | 'favorites' | 'history' | 'categories') => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Update counts
    setFavoritesCount(getFavoritesCount());
    setHistoryCount(getHistory().length);
  }, [currentPage]);

  const menuItems = [
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

  const handlePageChange = (page: typeof currentPage) => {
    onPageChange(page);
    setIsMenuOpen(false);
  };

  return (
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
                `}
              >
                <span className="flex items-center space-x-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

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
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
