/**
 * Advanced Features & Analytics System for InspirasiHub Phase 4
 * Handles analytics, insights, premium features, and advanced personalization
 */

export interface AnalyticsData {
  id: string;
  userId?: string;
  eventType: 'quote_view' | 'quote_share' | 'quote_favorite' | 'category_select' | 'search' | 'user_login' | 'user_register' | 'community_join' | 'quote_create' | 'session_visibility' | 'session_end';
  eventData: Record<string, any>;
  timestamp: string;
  sessionId: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenSize: string;
    language: string;
  };
  locationData?: {
    country: string;
    city: string;
    timezone: string;
  };
}

export interface UserInsights {
  userId: string;
  generatedAt: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  stats: {
    quotesViewed: number;
    favoriteQuotes: number;
    quotesShared: number;
    categoriesExplored: string[];
    activeHours: number[];
    activeDays: string[];
    avgSessionDuration: number;
    totalSessions: number;
  };
  preferences: {
    favoriteCategories: Array<{ category: string; count: number; percentage: number }>;
    favoriteAuthors: Array<{ author: string; count: number; percentage: number }>;
    peakActivity: { hour: number; day: string };
    preferredQuoteLength: 'short' | 'medium' | 'long';
    moodTrend: Array<{ date: string; mood: 'positive' | 'neutral' | 'negative' }>;
  };
  recommendations: {
    suggestedCategories: string[];
    suggestedAuthors: string[];
    suggestedUsers: string[];
    suggestedCommunities: string[];
    personalizedQuotes: string[];
  };
}

export interface AppInsights {
  generatedAt: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalQuotes: number;
    totalShares: number;
    totalFavorites: number;
    avgSessionDuration: number;
    retentionRate: number;
  };
  popular: {
    quotes: Array<{ id: string; content: string; views: number; shares: number }>;
    categories: Array<{ name: string; count: number; growth: number }>;
    authors: Array<{ name: string; count: number; growth: number }>;
    searchTerms: Array<{ term: string; count: number; growth: number }>;
  };
  trends: {
    dailyActiveUsers: Array<{ date: string; count: number }>;
    categoryGrowth: Array<{ category: string; growth: number; trend: 'up' | 'down' | 'stable' }>;
    userEngagement: Array<{ date: string; avgSessions: number; avgDuration: number }>;
    contentCreation: Array<{ date: string; quotes: number; communities: number }>;
  };
  geographic: {
    topCountries: Array<{ country: string; users: number; percentage: number }>;
    topCities: Array<{ city: string; users: number; percentage: number }>;
    timezoneDistribution: Array<{ timezone: string; users: number; percentage: number }>;
  };
}

export interface SmartRecommendation {
  id: string;
  userId: string;
  type: 'quote' | 'category' | 'author' | 'user' | 'community';
  targetId: string;
  reason: 'similar_interests' | 'popular_choice' | 'trending' | 'mood_based' | 'time_based' | 'location_based';
  confidence: number; // 0-100
  explanation: string;
  metadata: {
    basedOn: string[];
    similarUsers?: string[];
    trendingScore?: number;
    moodCompatibility?: number;
  };
  createdAt: string;
  expiresAt: string;
  isShown: boolean;
  userInteraction?: 'accepted' | 'dismissed' | 'hidden';
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'customization' | 'social' | 'content';
  icon: string;
  isActive: boolean;
  tier: 'basic' | 'pro' | 'premium';
  benefits: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  tier: 'free' | 'pro' | 'premium';
  startDate: string;
  endDate: string;
  isActive: boolean;
  features: string[];
  billing: {
    amount: number;
    currency: string;
    interval: 'monthly' | 'yearly';
    nextBillingDate: string;
    paymentMethod: string;
  };
  usage: {
    analyticsViews: number;
    advancedFilters: number;
    customThemes: number;
    prioritySupport: number;
  };
}

export interface CustomTheme {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isPremium: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    quote: string;
  };
  effects: {
    blur: number;
    opacity: number;
    gradientIntensity: number;
    shadowIntensity: number;
  };
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  likes: string[];
}

export interface AdvancedFilter {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  filters: {
    categories?: string[];
    authors?: string[];
    tags?: string[];
    length?: { min: number; max: number };
    mood?: 'positive' | 'neutral' | 'negative' | 'mixed';
    language?: string[];
    dateRange?: { start: string; end: string };
    popularity?: { min: number; max: number };
    sentiment?: number; // -1 to 1
  };
  sorting: {
    by: 'relevance' | 'popularity' | 'date' | 'length' | 'author' | 'random';
    order: 'asc' | 'desc';
  };
  createdAt: string;
  usageCount: number;
}

export interface AIInsight {
  id: string;
  type: 'mood_analysis' | 'content_suggestion' | 'behavior_pattern' | 'trend_prediction';
  title: string;
  content: string;
  confidence: number;
  dataPoints: Array<{ label: string; value: number; trend?: 'up' | 'down' | 'stable' }>;
  visualizations: Array<{
    type: 'chart' | 'graph' | 'heatmap' | 'wordcloud';
    config: Record<string, any>;
  }>;
  actionItems: Array<{
    action: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  }>;
  createdAt: string;
  relevantUntil: string;
}

export interface ExportData {
  id: string;
  userId: string;
  type: 'favorites' | 'history' | 'analytics' | 'full_profile';
  format: 'json' | 'csv' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt: string;
  requestedAt: string;
  completedAt?: string;
  fileSize?: number;
  recordCount?: number;
}

// Storage keys for Phase 4
export const PHASE4_STORAGE_KEYS = {
  ANALYTICS_DATA: 'inspirasi_analytics_data',
  USER_INSIGHTS: 'inspirasi_user_insights',
  APP_INSIGHTS: 'inspirasi_app_insights',
  RECOMMENDATIONS: 'inspirasi_recommendations',
  SUBSCRIPTIONS: 'inspirasi_subscriptions',
  CUSTOM_THEMES: 'inspirasi_custom_themes',
  ADVANCED_FILTERS: 'inspirasi_advanced_filters',
  AI_INSIGHTS: 'inspirasi_ai_insights',
  EXPORT_REQUESTS: 'inspirasi_export_requests',
  PREMIUM_FEATURES: 'inspirasi_premium_features'
} as const;

// Phase 4 Component Props
export interface AnalyticsDashboardProps {
  userId: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  insights: UserInsights;
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export interface RecommendationFeedProps {
  recommendations: SmartRecommendation[];
  onInteraction: (id: string, action: 'accepted' | 'dismissed' | 'hidden') => void;
}

export interface ThemeCustomizerProps {
  currentTheme: CustomTheme;
  isPremium: boolean;
  onThemeChange: (theme: Partial<CustomTheme>) => void;
  onSave: (theme: CustomTheme) => void;
}

export interface AdvancedSearchProps {
  filters: AdvancedFilter[];
  currentFilter?: AdvancedFilter;
  isPremium: boolean;
  onFilterApply: (filter: AdvancedFilter) => void;
  onFilterSave: (filter: AdvancedFilter) => void;
}

export interface AIInsightsProps {
  insights: AIInsight[];
  isLoading: boolean;
  onRefresh: () => void;
  onActionClick: (insight: AIInsight, action: string) => void;
}
