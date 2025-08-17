'use client';

import { useState, useEffect } from 'react';
import QuoteCard from '@/components/QuoteCard';
import FavoritesPage from '@/components/FavoritesPage';
import HistoryPage from '@/components/HistoryPage';
import CategoriesPage from '@/components/CategoriesPage';
import Navigation from '@/components/Navigation';
import CommunityFeed from '@/components/CommunityFeed';
import CreateQuoteModal from '@/components/CreateQuoteModal';
import UserProfile from '@/components/UserProfile';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import PremiumUpgradeModal from '@/components/PremiumUpgradeModal';
import AISearchComponent from '@/components/AISearchComponent';
import { UserSystem } from '@/lib/userSystem';
import { User, UserQuote } from '@/types/phase3';
import { UserInsights } from '@/types/phase4';
import { AISearchQuery } from '@/types/phase5';
import AnalyticsService from '@/lib/analyticsService';
import PremiumService from '@/lib/premiumService';
import AIService from '@/lib/aiService';

type PageType = 'home' | 'favorites' | 'history' | 'categories' | 'community' | 'profile' | 'create' | 'analytics' | 'premium';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analyticsInsights, setAnalyticsInsights] = useState<UserInsights | null>(null);
  
  // Phase 5 states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);
  const [searchHistory, setSearchHistory] = useState<AISearchQuery[]>([]);
  const [userTier, setUserTier] = useState<'free' | 'premium' | 'pro'>('free');

  useEffect(() => {
    // Check for logged in user
    setCurrentUser(UserSystem.getCurrentUser());
  }, []);

  useEffect(() => {
    // Show create modal when 'create' page is selected
    if (currentPage === 'create') {
      setShowCreateModal(true);
      // Reset to previous page since we're using a modal
      setCurrentPage('community');
    }
  }, [currentPage]);

  useEffect(() => {
    // Load analytics data when user is available
    if (currentUser) {
      const loadAnalytics = async () => {
        try {
          const analyticsInstance = AnalyticsService.getInstance();
          const insights = analyticsInstance.generateUserInsights(currentUser.id, analyticsTimeRange);
          setAnalyticsInsights(insights);
        } catch (error) {
          console.error('Error loading analytics:', error);
          // Set default insights
          setAnalyticsInsights({
            userId: currentUser.id,
            generatedAt: new Date().toISOString(),
            timeRange: analyticsTimeRange,
            stats: {
              quotesViewed: 0,
              favoriteQuotes: 0,
              quotesShared: 0,
              categoriesExplored: [],
              activeHours: [],
              activeDays: [],
              avgSessionDuration: 0,
              totalSessions: 0
            },
            preferences: {
              favoriteCategories: [],
              favoriteAuthors: [],
              peakActivity: { hour: 12, day: 'Monday' },
              preferredQuoteLength: 'medium',
              moodTrend: []
            },
            recommendations: {
              suggestedCategories: [],
              suggestedAuthors: [],
              suggestedUsers: [],
              suggestedCommunities: [],
              personalizedQuotes: []
            }
          });
        }
      };
      loadAnalytics();
    }
  }, [currentUser, analyticsTimeRange]);

  useEffect(() => {
    // Load premium subscription data
    if (currentUser) {
      const loadPremiumData = async () => {
        try {
          const premiumService = PremiumService.getInstance();
          const subscription = await premiumService.checkSubscription(currentUser.id);
          setUserTier(subscription.tier);
        } catch (error) {
          console.error('Error loading premium data:', error);
        }
      };
      loadPremiumData();
    }
  }, [currentUser]);

  const handleCreateQuoteSuccess = (quote: UserQuote) => {
    setShowCreateModal(false);
    // Optionally navigate to community to see the new quote
    setCurrentPage('community');
  };

  // Phase 5 handlers
  const handlePremiumUpgrade = async (tier: 'free' | 'premium' | 'pro') => {
    if (!currentUser || tier === 'free') return;
    
    try {
      const premiumService = PremiumService.getInstance();
      const success = await premiumService.upgradeSubscription(currentUser.id, tier);
      
      if (success) {
        setUserTier(tier);
        setShowPremiumModal(false);
        alert(`🎉 Selamat! Anda berhasil upgrade ke ${tier}!`);
      } else {
        alert('Upgrade gagal. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Terjadi kesalahan saat upgrade.');
    }
  };

  const handleAISearch = async (query: AISearchQuery) => {
    try {
      const aiService = AIService.getInstance();
      const results = await aiService.searchQuotes(query);
      
      // Update search history
      setSearchHistory(prev => [query, ...prev.slice(0, 9)]); // Keep last 10 searches
    } catch (error) {
      console.error('AI Search error:', error);
    }
  };

  const handleOpenAISearch = () => {
    if (userTier === 'free') {
      setShowPremiumModal(true);
      return;
    }
    setShowAISearch(true);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'favorites':
        return <FavoritesPage />;
      case 'history':
        return <HistoryPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'community':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <CommunityFeed 
              currentUser={currentUser}
              onProfileClick={(userId) => {
                // TODO: Navigate to specific user profile
                setCurrentPage('profile');
              }}
              onQuoteClick={(quote) => {
                // TODO: Show quote detail modal
                console.log('Quote clicked:', quote);
              }}
            />
          </div>
        );
      case 'analytics':
        if (!currentUser) {
          return (
            <div className="max-w-4xl mx-auto p-6 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Analytics Dashboard
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Anda harus login untuk melihat analytics
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="max-w-4xl mx-auto p-6">
            <AnalyticsDashboard 
              userId={currentUser.id}
              timeRange={analyticsTimeRange}
              insights={analyticsInsights || {
                userId: currentUser.id,
                generatedAt: new Date().toISOString(),
                timeRange: analyticsTimeRange,
                stats: {
                  quotesViewed: 0,
                  favoriteQuotes: 0,
                  quotesShared: 0,
                  categoriesExplored: [],
                  activeHours: [],
                  activeDays: [],
                  avgSessionDuration: 0,
                  totalSessions: 0
                },
                preferences: {
                  favoriteCategories: [],
                  favoriteAuthors: [],
                  peakActivity: { hour: 12, day: 'Monday' },
                  preferredQuoteLength: 'medium',
                  moodTrend: []
                },
                recommendations: {
                  suggestedCategories: [],
                  suggestedAuthors: [],
                  suggestedUsers: [],
                  suggestedCommunities: [],
                  personalizedQuotes: []
                }
              }}
              onTimeRangeChange={setAnalyticsTimeRange}
            />
          </div>
        );
      case 'premium':
        if (userTier === 'free') {
          setShowPremiumModal(true);
          setCurrentPage('home');
          return null;
        }
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">💎</div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Premium Dashboard
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Kelola subscription dan akses fitur premium Anda
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    Status Subscription
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Tier saat ini: <span className="font-bold text-blue-600">{userTier.toUpperCase()}</span>
                  </p>
                  <button 
                    onClick={() => setShowPremiumModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Kelola Subscription
                  </button>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900 dark:to-teal-900 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    Fitur Premium
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Akses penuh ke semua fitur canggih
                  </p>
                  <button 
                    onClick={handleOpenAISearch}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    🤖 Buka AI Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        if (!currentUser) {
          return (
            <div className="max-w-4xl mx-auto p-6 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Akses Terbatas
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Anda harus login untuk melihat profil
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="max-w-4xl mx-auto p-6">
            <UserProfile 
              userId={currentUser.id}
              onClose={() => setCurrentPage('home')}
            />
          </div>
        );
      default:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* OAuth Features Announcement */}
            {!currentUser && (
              <div className="w-full max-w-4xl mx-auto mb-6">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-2xl">🎉</span>
                    <div className="text-center">
                      <h3 className="font-bold text-lg">Fitur Baru: Login dengan Google & GitHub!</h3>
                      <p className="text-sm opacity-90">Akses lebih mudah dengan UI modern dan minimalis</p>
                    </div>
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                InspirasiHub ✨
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                Kumpulan quotes inspiratif dalam bahasa Indonesia
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                Temukan inspirasi baru setiap hari dengan koleksi quotes pilihan
              </p>
              
              {/* Phase 3 Features Preview */}
              {!currentUser && (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    🌟 Fitur Baru - Komunitas Inspirasi!
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left">
                    <li className="flex items-center space-x-2">
                      <span>🔐</span>
                      <span>Login dengan Google, GitHub, atau Email</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span>✍️</span>
                      <span>Buat dan bagikan quotes Anda sendiri</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span>❤️</span>
                      <span>Like dan komentar quotes favorit</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span>👥</span>
                      <span>Follow pengguna dan bangun komunitas</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span>🔔</span>
                      <span>Notifikasi real-time untuk interaksi</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                    Daftar sekarang untuk mengakses semua fitur!
                  </p>
                </div>
              )}
            </div>
            
            <QuoteCard />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onAISearchOpen={handleOpenAISearch}
      />
      
      <main className="pb-8">
        {renderCurrentPage()}
      </main>
      
      {/* Create Quote Modal */}
      {showCreateModal && (
        <CreateQuoteModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateQuoteSuccess}
        />
      )}
      
      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        currentTier={userTier}
        onUpgrade={handlePremiumUpgrade}
      />
      
      {/* AI Search Modal */}
      <AISearchComponent
        isVisible={showAISearch}
        onClose={() => setShowAISearch(false)}
        onSearch={handleAISearch}
        searchHistory={searchHistory}
        isPremium={userTier !== 'free'}
      />
      
      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>InspirasiHub</strong> - Platform inspirasi dalam bahasa Indonesia
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Data quotes dari{' '}
              <a 
                href="https://github.com/lakuapik/quotes-indonesia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Quotes Indonesia
              </a>
              {' '}oleh David Adi Nugroho • Built with ❤️ using Next.js 14
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
