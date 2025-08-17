/**
 * Analytics Dashboard Component for Phase 4
 * Displays user insights, statistics, and recommendations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { UserInsights, AnalyticsDashboardProps } from '../types/phase4';
import AnalyticsService from '../lib/analyticsService';

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userId,
  timeRange,
  insights,
  onTimeRangeChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'preferences' | 'recommendations'>('overview');

  const timeRangeOptions = [
    { value: '7d', label: '7 Hari Terakhir' },
    { value: '30d', label: '30 Hari Terakhir' },
    { value: '90d', label: '3 Bulan Terakhir' },
    { value: '1y', label: '1 Tahun Terakhir' }
  ];

  const refreshInsights = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: string; trend?: number }> = ({ 
    title, 
    value, 
    icon, 
    trend 
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <svg className={`w-4 h-4 mr-1 ${trend >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14l5-5 5 5z"/>
              </svg>
              {Math.abs(trend)}% dari periode sebelumnya
            </div>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  const PreferenceChart: React.FC<{ data: Array<{ category?: string; author?: string; percentage: number }> }> = ({ data }) => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {item.category || item.author}
          </span>
          <div className="flex items-center space-x-3">
            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{item.percentage}%</span>
          </div>
        </div>
      ))}
    </div>
  );

  const MoodTrendChart: React.FC<{ data: Array<{ date: string; mood: 'positive' | 'neutral' | 'negative' }> }> = ({ data }) => (
    <div className="flex items-end space-x-2 h-32">
      {data.map((item, index) => {
        const moodColors = {
          positive: 'bg-green-500',
          neutral: 'bg-yellow-500',
          negative: 'bg-red-500'
        };
        
        const heights = {
          positive: 'h-full',
          neutral: 'h-2/3',
          negative: 'h-1/3'
        };

        return (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className={`w-full ${moodColors[item.mood]} ${heights[item.mood]} rounded-t-md transition-all duration-300`} />
            <span className="text-xs text-gray-500 mt-1">
              {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' })}
            </span>
          </div>
        );
      })}
    </div>
  );

  const RecommendationCard: React.FC<{ title: string; items: string[]; icon: string }> = ({ title, items, icon }) => (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.slice(0, 3).map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">{item}</span>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
              Explore
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📊 Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights dan statistik aktivitas Anda
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={refreshInsights}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? '🔄' : '↻'} Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: '📈' },
          { id: 'preferences', label: 'Preferences', icon: '❤️' },
          { id: 'recommendations', label: 'Recommendations', icon: '🎯' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Quotes Dilihat"
              value={insights.stats.quotesViewed}
              icon="👁️"
              trend={12}
            />
            <StatCard
              title="Quotes Favorit"
              value={insights.stats.favoriteQuotes}
              icon="❤️"
              trend={8}
            />
            <StatCard
              title="Quotes Dibagikan"
              value={insights.stats.quotesShared}
              icon="📤"
              trend={-3}
            />
            <StatCard
              title="Total Sesi"
              value={insights.stats.totalSessions}
              icon="⏱️"
              trend={15}
            />
          </div>

          {/* Activity Pattern */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📅 Pola Aktivitas
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jam Paling Aktif</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {insights.preferences.peakActivity.hour}:00
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hari Paling Aktif</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {insights.preferences.peakActivity.day}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Durasi Rata-rata Sesi</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(insights.stats.avgSessionDuration / 60)} menit
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                😊 Mood Trend (7 Hari Terakhir)
              </h3>
              <MoodTrendChart data={insights.preferences.moodTrend} />
              <div className="flex justify-center space-x-4 mt-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Positif
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  Netral
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  Negatif
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📚 Kategori Favorit
              </h3>
              <PreferenceChart data={insights.preferences.favoriteCategories} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ✍️ Penulis Favorit
              </h3>
              <PreferenceChart data={insights.preferences.favoriteAuthors} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📏 Preferensi Panjang Quote
              </h3>
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {insights.preferences.preferredQuoteLength === 'short' ? '📝' : 
                   insights.preferences.preferredQuoteLength === 'medium' ? '📄' : '📋'}
                </div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 capitalize">
                  {insights.preferences.preferredQuoteLength === 'short' ? 'Pendek' :
                   insights.preferences.preferredQuoteLength === 'medium' ? 'Sedang' : 'Panjang'}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🌍 Kategori Dijelajahi
              </h3>
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {insights.stats.categoriesExplored.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  kategori berbeda
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📅 Hari Aktif
              </h3>
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {insights.stats.activeDays.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  hari dalam seminggu
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecommendationCard
              title="Kategori yang Mungkin Anda Suka"
              items={insights.recommendations.suggestedCategories}
              icon="🏷️"
            />
            <RecommendationCard
              title="Penulis yang Direkomendasikan"
              items={insights.recommendations.suggestedAuthors}
              icon="✨"
            />
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🤖</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Recommendations
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Berdasarkan analisis mendalam aktivitas Anda, berikut adalah rekomendasi personal untuk meningkatkan pengalaman Anda:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Waktu Optimal</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kunjungi aplikasi sekitar jam {insights.preferences.peakActivity.hour}:00 untuk mendapatkan quotes yang paling relevan dengan mood Anda.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎯 Eksplorasi Baru</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Coba jelajahi kategori {insights.recommendations.suggestedCategories[0]} untuk memperluas wawasan Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
