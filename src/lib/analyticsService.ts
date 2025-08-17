/**
 * Analytics Service for InspirasiHub Phase 4
 * Tracks user behavior and generates insights
 */

import { AnalyticsData, UserInsights, AppInsights, SmartRecommendation, PHASE4_STORAGE_KEYS } from '../types/phase4';
import { User } from '../types/phase3';

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private deviceInfo: AnalyticsData['deviceInfo'];

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.deviceInfo = this.getDeviceInfo();
    this.initializeTracking();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo(): AnalyticsData['deviceInfo'] {
    if (typeof window === 'undefined') {
      return {
        userAgent: 'server',
        platform: 'server',
        screenSize: 'unknown',
        language: 'en'
      };
    }

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language
    };
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.track('session_visibility', {
        visible: !document.hidden,
        timestamp: Date.now()
      });
    });

    // Track session duration
    window.addEventListener('beforeunload', () => {
      this.track('session_end', {
        duration: Date.now() - parseInt(this.sessionId.split('_')[1]),
        sessionId: this.sessionId
      });
    });
  }

  /**
   * Track an analytics event
   */
  track(eventType: AnalyticsData['eventType'], eventData: Record<string, any>, userId?: string): void {
    const analyticsEvent: AnalyticsData = {
      id: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      deviceInfo: this.deviceInfo
    };

    // Add location data if available
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      // Note: In production, you'd want to get user permission for location
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      analyticsEvent.locationData = {
        country: 'Unknown', // Would be determined by IP in production
        city: 'Unknown',    // Would be determined by IP in production
        timezone
      };
    }

    this.saveAnalyticsEvent(analyticsEvent);
  }

  private saveAnalyticsEvent(event: AnalyticsData): void {
    try {
      const existingEvents = this.getStoredAnalytics();
      existingEvents.push(event);
      
      // Keep only last 1000 events to prevent storage overflow
      const recentEvents = existingEvents.slice(-1000);
      
      localStorage.setItem(PHASE4_STORAGE_KEYS.ANALYTICS_DATA, JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Failed to save analytics event:', error);
    }
  }

  private getStoredAnalytics(): AnalyticsData[] {
    try {
      const stored = localStorage.getItem(PHASE4_STORAGE_KEYS.ANALYTICS_DATA);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load analytics data:', error);
      return [];
    }
  }

  /**
   * Generate user insights based on analytics data
   */
  generateUserInsights(userId: string, timeRange: UserInsights['timeRange'] = '30d'): UserInsights {
    const events = this.getStoredAnalytics().filter(event => 
      event.userId === userId && 
      this.isWithinTimeRange(event.timestamp, timeRange)
    );

    const stats = this.calculateUserStats(events);
    const preferences = this.analyzeUserPreferences(events);
    const recommendations = this.generateRecommendations(userId, events, preferences);

    return {
      userId,
      generatedAt: new Date().toISOString(),
      timeRange,
      stats,
      preferences,
      recommendations
    };
  }

  private isWithinTimeRange(timestamp: string, timeRange: UserInsights['timeRange']): boolean {
    const eventDate = new Date(timestamp);
    const now = new Date();
    const daysAgo = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[timeRange];

    const cutoff = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return eventDate >= cutoff;
  }

  private calculateUserStats(events: AnalyticsData[]): UserInsights['stats'] {
    const sessions = new Set(events.map(e => e.sessionId));
    const quotesViewed = events.filter(e => e.eventType === 'quote_view').length;
    const favoriteQuotes = events.filter(e => e.eventType === 'quote_favorite').length;
    const quotesShared = events.filter(e => e.eventType === 'quote_share').length;
    
    const categoryEvents = events.filter(e => e.eventType === 'category_select');
    const categoriesExplored = [...new Set(categoryEvents.map(e => e.eventData.category))];

    // Calculate active hours and days
    const eventHours = events.map(e => new Date(e.timestamp).getHours());
    const eventDays = events.map(e => new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'long' }));
    
    const activeHours = Array.from(new Set(eventHours)).sort((a, b) => a - b);
    const activeDays = Array.from(new Set(eventDays));

    // Calculate session duration (simplified)
    const avgSessionDuration = events.length > 0 ? 
      events.reduce((sum, event) => sum + (event.eventData.duration || 300), 0) / sessions.size : 0;

    return {
      quotesViewed,
      favoriteQuotes,
      quotesShared,
      categoriesExplored,
      activeHours,
      activeDays,
      avgSessionDuration,
      totalSessions: sessions.size
    };
  }

  private analyzeUserPreferences(events: AnalyticsData[]): UserInsights['preferences'] {
    const categoryEvents = events.filter(e => e.eventType === 'category_select');
    const quoteEvents = events.filter(e => e.eventType === 'quote_view');

    // Analyze favorite categories
    const categoryCount: Record<string, number> = {};
    categoryEvents.forEach(event => {
      const category = event.eventData.category;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const totalCategories = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);
    const favoriteCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalCategories) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Analyze favorite authors
    const authorCount: Record<string, number> = {};
    quoteEvents.forEach(event => {
      const author = event.eventData.author;
      if (author) {
        authorCount[author] = (authorCount[author] || 0) + 1;
      }
    });

    const totalAuthors = Object.values(authorCount).reduce((sum, count) => sum + count, 0);
    const favoriteAuthors = Object.entries(authorCount)
      .map(([author, count]) => ({
        author,
        count,
        percentage: totalAuthors > 0 ? Math.round((count / totalAuthors) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Find peak activity
    const hourCounts: Record<number, number> = {};
    const dayCounts: Record<string, number> = {};
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      const day = new Date(event.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts).reduce((a, b) => hourCounts[parseInt(a[0])] > hourCounts[parseInt(b[0])] ? a : b, ['0', 0]);
    const peakDay = Object.entries(dayCounts).reduce((a, b) => dayCounts[a[0]] > dayCounts[b[0]] ? a : b, ['Monday', 0]);

    // Analyze quote length preference
    const quoteLengths = quoteEvents.map(event => event.eventData.quoteLength || 'medium');
    const lengthCounts = quoteLengths.reduce((acc: Record<string, number>, length) => {
      acc[length] = (acc[length] || 0) + 1;
      return acc;
    }, {});
    
    const preferredQuoteLength = Object.entries(lengthCounts).reduce((a, b) => 
      lengthCounts[a[0]] > lengthCounts[b[0]] ? a : b, ['medium', 0])[0] as 'short' | 'medium' | 'long';

    // Generate mood trend (simplified)
    const moodTrend = this.generateMoodTrend(events);

    return {
      favoriteCategories,
      favoriteAuthors,
      peakActivity: {
        hour: parseInt(peakHour[0]),
        day: peakDay[0]
      },
      preferredQuoteLength,
      moodTrend
    };
  }

  private generateMoodTrend(events: AnalyticsData[]): Array<{ date: string; mood: 'positive' | 'neutral' | 'negative' }> {
    // Simplified mood analysis based on activity patterns
    const dailyActivity: Record<string, number> = {};
    
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    return Object.entries(dailyActivity)
      .slice(-7) // Last 7 days
      .map(([date, activity]) => ({
        date,
        mood: activity > 10 ? 'positive' : activity > 5 ? 'neutral' : 'negative'
      }));
  }

  private generateRecommendations(userId: string, events: AnalyticsData[], preferences: UserInsights['preferences']): UserInsights['recommendations'] {
    const topCategories = preferences.favoriteCategories.slice(0, 3).map(c => c.category);
    const topAuthors = preferences.favoriteAuthors.slice(0, 3).map(a => a.author);

    return {
      suggestedCategories: this.getSuggestedCategories(topCategories),
      suggestedAuthors: this.getSuggestedAuthors(topAuthors),
      suggestedUsers: [], // Would be based on similar user behavior
      suggestedCommunities: [], // Would be based on interests
      personalizedQuotes: [] // Would be based on ML recommendations
    };
  }

  private getSuggestedCategories(favoriteCategories: string[]): string[] {
    // Related categories mapping (simplified)
    const categoryRelations: Record<string, string[]> = {
      'motivational': ['success', 'wisdom', 'inspirational'],
      'love': ['relationship', 'friendship', 'family'],
      'wisdom': ['philosophy', 'life', 'truth'],
      'success': ['business', 'motivational', 'leadership'],
      'happiness': ['life', 'positive', 'joy']
    };

    const suggestions = new Set<string>();
    favoriteCategories.forEach(category => {
      const related = categoryRelations[category] || [];
      related.forEach(rel => suggestions.add(rel));
    });

    return Array.from(suggestions).slice(0, 5);
  }

  private getSuggestedAuthors(favoriteAuthors: string[]): string[] {
    // Author similarity mapping (simplified)
    const authorRelations: Record<string, string[]> = {
      'Albert Einstein': ['Stephen Hawking', 'Isaac Newton', 'Nikola Tesla'],
      'Maya Angelou': ['Oprah Winfrey', 'Toni Morrison', 'James Baldwin'],
      'Steve Jobs': ['Bill Gates', 'Elon Musk', 'Mark Zuckerberg'],
      'Gandhi': ['Nelson Mandela', 'Martin Luther King Jr.', 'Mother Teresa']
    };

    const suggestions = new Set<string>();
    favoriteAuthors.forEach(author => {
      const related = authorRelations[author] || [];
      related.forEach(rel => suggestions.add(rel));
    });

    return Array.from(suggestions).slice(0, 5);
  }

  /**
   * Generate app-wide insights for admin dashboard
   */
  generateAppInsights(timeRange: AppInsights['timeRange'] = '30d'): AppInsights {
    const allEvents = this.getStoredAnalytics().filter(event => 
      this.isWithinTimeRange(event.timestamp, timeRange)
    );

    const overview = this.calculateAppOverview(allEvents);
    const popular = this.calculatePopularContent(allEvents);
    const trends = this.calculateTrends(allEvents, timeRange);
    const geographic = this.calculateGeographicData(allEvents);

    return {
      generatedAt: new Date().toISOString(),
      timeRange,
      overview,
      popular,
      trends,
      geographic
    };
  }

  private calculateAppOverview(events: AnalyticsData[]): AppInsights['overview'] {
    const uniqueUsers = new Set(events.filter(e => e.userId).map(e => e.userId!));
    const sessions = new Set(events.map(e => e.sessionId));
    const newUsers = events.filter(e => e.eventType === 'user_register').length;
    
    const quoteViews = events.filter(e => e.eventType === 'quote_view').length;
    const shares = events.filter(e => e.eventType === 'quote_share').length;
    const favorites = events.filter(e => e.eventType === 'quote_favorite').length;

    const sessionDurations = events
      .filter(e => e.eventData.duration)
      .map(e => e.eventData.duration as number);
    
    const avgSessionDuration = sessionDurations.length > 0 ? 
      sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length : 0;

    return {
      totalUsers: uniqueUsers.size,
      activeUsers: uniqueUsers.size, // Simplified - would track recent activity
      newUsers,
      totalQuotes: quoteViews,
      totalShares: shares,
      totalFavorites: favorites,
      avgSessionDuration,
      retentionRate: 0.75 // Would be calculated based on return visits
    };
  }

  private calculatePopularContent(events: AnalyticsData[]): AppInsights['popular'] {
    // Popular quotes
    const quoteViews: Record<string, { content: string; views: number; shares: number }> = {};
    events.filter(e => e.eventType === 'quote_view').forEach(event => {
      const quoteId = event.eventData.quoteId;
      if (!quoteViews[quoteId]) {
        quoteViews[quoteId] = {
          content: event.eventData.content || 'Unknown quote',
          views: 0,
          shares: 0
        };
      }
      quoteViews[quoteId].views++;
    });

    events.filter(e => e.eventType === 'quote_share').forEach(event => {
      const quoteId = event.eventData.quoteId;
      if (quoteViews[quoteId]) {
        quoteViews[quoteId].shares++;
      }
    });

    const popularQuotes = Object.entries(quoteViews)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Popular categories, authors, search terms (simplified)
    const categories = this.getPopularItems(events, 'category_select', 'category');
    const authors = this.getPopularItems(events, 'quote_view', 'author');
    const searchTerms = this.getPopularItems(events, 'search', 'term');

    return {
      quotes: popularQuotes,
      categories,
      authors,
      searchTerms: searchTerms.map(item => ({ term: item.name, count: item.count, growth: item.growth }))
    };
  }

  private getPopularItems(events: AnalyticsData[], eventType: string, field: string): Array<{ name: string; count: number; growth: number }> {
    const counts: Record<string, number> = {};
    
    events.filter(e => e.eventType === eventType).forEach(event => {
      const value = event.eventData[field];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        growth: Math.random() * 20 - 10 // Simplified growth calculation
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateTrends(events: AnalyticsData[], timeRange: string): AppInsights['trends'] {
    // Daily active users
    const dailyUsers: Record<string, Set<string>> = {};
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!dailyUsers[date]) {
        dailyUsers[date] = new Set();
      }
      if (event.userId) {
        dailyUsers[date].add(event.userId);
      }
    });

    const dailyActiveUsers = Object.entries(dailyUsers)
      .map(([date, users]) => ({ date, count: users.size }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Simplified trend calculations
    const categoryGrowth = [
      { category: 'motivational', growth: 15, trend: 'up' as const },
      { category: 'wisdom', growth: -5, trend: 'down' as const },
      { category: 'love', growth: 2, trend: 'stable' as const }
    ];

    const userEngagement = dailyActiveUsers.map(day => ({
      date: day.date,
      avgSessions: 2.5,
      avgDuration: 180
    }));

    const contentCreation = dailyActiveUsers.map(day => ({
      date: day.date,
      quotes: Math.floor(Math.random() * 50),
      communities: Math.floor(Math.random() * 5)
    }));

    return {
      dailyActiveUsers,
      categoryGrowth,
      userEngagement,
      contentCreation
    };
  }

  private calculateGeographicData(events: AnalyticsData[]): AppInsights['geographic'] {
    // Simplified geographic data
    return {
      topCountries: [
        { country: 'Indonesia', users: 450, percentage: 45 },
        { country: 'United States', users: 200, percentage: 20 },
        { country: 'India', users: 150, percentage: 15 }
      ],
      topCities: [
        { city: 'Jakarta', users: 120, percentage: 12 },
        { city: 'New York', users: 80, percentage: 8 },
        { city: 'Mumbai', users: 60, percentage: 6 }
      ],
      timezoneDistribution: [
        { timezone: 'Asia/Jakarta', users: 450, percentage: 45 },
        { timezone: 'America/New_York', users: 200, percentage: 20 },
        { timezone: 'Asia/Kolkata', users: 150, percentage: 15 }
      ]
    };
  }

  /**
   * Clear analytics data (for privacy compliance)
   */
  clearAnalyticsData(userId?: string): void {
    if (userId) {
      // Clear data for specific user
      const events = this.getStoredAnalytics().filter(event => event.userId !== userId);
      localStorage.setItem(PHASE4_STORAGE_KEYS.ANALYTICS_DATA, JSON.stringify(events));
    } else {
      // Clear all analytics data
      localStorage.removeItem(PHASE4_STORAGE_KEYS.ANALYTICS_DATA);
    }
  }

  /**
   * Export analytics data
   */
  exportAnalyticsData(userId?: string, format: 'json' | 'csv' = 'json'): string {
    const events = userId ? 
      this.getStoredAnalytics().filter(event => event.userId === userId) : 
      this.getStoredAnalytics();

    if (format === 'csv') {
      return this.convertToCSV(events);
    }

    return JSON.stringify(events, null, 2);
  }

  private convertToCSV(events: AnalyticsData[]): string {
    if (events.length === 0) return '';

    const headers = ['timestamp', 'eventType', 'userId', 'sessionId', 'platform', 'eventData'];
    const rows = events.map(event => [
      event.timestamp,
      event.eventType,
      event.userId || '',
      event.sessionId,
      event.deviceInfo.platform,
      JSON.stringify(event.eventData)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export default AnalyticsService;
