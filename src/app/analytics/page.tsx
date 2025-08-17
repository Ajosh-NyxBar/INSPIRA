'use client';

import { useState, useEffect } from 'react';
import { UserInsights } from '@/types/phase4';
import { UserSystem } from '@/lib/userSystem';
import AnalyticsService from '@/lib/analyticsService';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import Navigation from '@/components/Navigation';

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(UserSystem.getCurrentUser());

  const analytics = AnalyticsService.getInstance();

  const handlePageChange = (page: string) => {
    window.location.href = `/${page === 'home' ? '' : page}`;
  };

  useEffect(() => {
    const currentUser = UserSystem.getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      generateInsights(currentUser.id, timeRange);
    } else {
      setLoading(false);
    }
  }, [timeRange]);

  const generateInsights = (userId: string, range: UserInsights['timeRange']) => {
    setLoading(true);
    try {
      const userInsights = analytics.generateUserInsights(userId, range);
      setInsights(userInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (newRange: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(newRange);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation currentPage="analytics" onPageChange={handlePageChange} />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Login Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need to be logged in to view your analytics dashboard.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation currentPage="analytics" onPageChange={handlePageChange} />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="animate-spin text-6xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Generating Insights
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Analyzing your data to create personalized insights...
              </p>
              <div className="mt-6">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation currentPage="analytics" onPageChange={handlePageChange} />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Data Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start using the app to generate insights about your quote preferences and behavior.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200"
              >
                Start Exploring Quotes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation currentPage="analytics" onPageChange={handlePageChange} />
      <div className="container mx-auto px-4 py-8">
        <AnalyticsDashboard
          userId={user.id}
          timeRange={timeRange}
          insights={insights}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </div>
    </div>
  );
}
