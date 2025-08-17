/**
 * Phase 5 Type Definitions
 * Premium Features & Advanced AI
 * Date: August 17, 2025
 */

// ==================== PREMIUM SUBSCRIPTION SYSTEM ====================

export interface PremiumTier {
  id: 'free' | 'premium' | 'pro';
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: PremiumFeature[];
  limits: {
    dailyQuotes: number;
    analyticsHistory: number; // days
    customThemes: number;
    aiRequests: number; // per day
    exportFormats: string[];
  };
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'analytics' | 'customization' | 'ai' | 'export' | 'support';
  requiresTier: 'premium' | 'pro';
}

export interface UserSubscription {
  userId: string;
  tier: PremiumTier['id'];
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: {
    type: 'card' | 'paypal' | 'bank';
    last4?: string;
    expiryDate?: string;
  };
  usage: {
    dailyQuotesUsed: number;
    aiRequestsUsed: number;
    lastResetDate: string;
  };
}

// ==================== ADVANCED AI FEATURES ====================

export interface AISearchQuery {
  id: string;
  query: string;
  type: 'semantic' | 'sentiment' | 'category' | 'author' | 'keyword';
  filters: {
    sentiment?: 'positive' | 'negative' | 'neutral';
    category?: string[];
    author?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    length?: 'short' | 'medium' | 'long';
  };
  results: AISearchResult[];
  timestamp: string;
  userId: string;
}

export interface AISearchResult {
  quote: {
    id: string;
    text: string;
    author: string;
    category: string;
  };
  relevanceScore: number;
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  keywords: string[];
  explanation: string;
}

export interface SentimentAnalysis {
  text: string;
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral';
    score: number; // -1 to 1
    confidence: number; // 0 to 1
  };
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    trust: number;
  };
  keywords: Array<{
    word: string;
    sentiment: number;
    importance: number;
  }>;
  suggestions: string[];
}

export interface AIContentGenerator {
  type: 'quote' | 'affirmation' | 'reflection' | 'goal';
  prompt: string;
  style: 'inspirational' | 'motivational' | 'philosophical' | 'spiritual' | 'practical';
  tone: 'formal' | 'casual' | 'poetic' | 'direct';
  length: 'short' | 'medium' | 'long';
  language: 'id' | 'en';
}

export interface GeneratedContent {
  id: string;
  content: string;
  type: AIContentGenerator['type'];
  metadata: {
    prompt: string;
    style: string;
    tone: string;
    generatedAt: string;
    userId: string;
    aiModel: string;
    confidence: number;
  };
  rating?: number;
  feedback?: string;
}

export interface PredictiveRecommendation {
  id: string;
  type: 'quote' | 'category' | 'author' | 'activity' | 'goal';
  content: any;
  confidence: number;
  reasoning: string;
  triggers: string[];
  predictedEngagement: number;
  validUntil: string;
  userId: string;
}

// ==================== CUSTOM THEMES & PERSONALIZATION ====================

export interface CustomTheme {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  isUserCreated: boolean;
  userId?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    gradient: {
      from: string;
      to: string;
      direction: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      base: string;
      large: string;
      xl: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      bold: string;
    };
  };
  effects: {
    glassmorphism: boolean;
    shadows: boolean;
    animations: boolean;
    borderRadius: string;
    backdropBlur: string;
  };
  layout: {
    cardSpacing: string;
    containerWidth: string;
    headerHeight: string;
    navigationStyle: 'bottom' | 'top' | 'side';
  };
}

export interface ThemeCustomizer {
  activeTheme: CustomTheme;
  presets: CustomTheme[];
  customization: {
    allowColorPicker: boolean;
    allowFontSelection: boolean;
    allowLayoutChanges: boolean;
    allowEffectToggle: boolean;
  };
}

// ==================== ADVANCED EXPORT & SHARING ====================

export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv' | 'docx' | 'image' | 'epub';
  content: {
    quotes: boolean;
    analytics: boolean;
    favorites: boolean;
    history: boolean;
    themes: boolean;
    settings: boolean;
  };
  customization: {
    includeImages: boolean;
    includeMetadata: boolean;
    groupByCategory: boolean;
    addWatermark: boolean;
    templateStyle: 'minimal' | 'elegant' | 'creative' | 'professional';
  };
  scheduling?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    email: string;
  };
}

export interface ShareableCollection {
  id: string;
  name: string;
  description: string;
  quotes: string[];
  isPublic: boolean;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    views: number;
    likes: number;
    shares: number;
    downloads: number;
  };
  settings: {
    allowComments: boolean;
    allowForks: boolean;
    requireAttribution: boolean;
  };
}

// ==================== PREMIUM ANALYTICS ====================

export interface AdvancedAnalytics {
  crossDeviceSync: {
    devices: Array<{
      deviceId: string;
      deviceName: string;
      platform: string;
      lastSeen: string;
      isActive: boolean;
    }>;
    syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
    lastSync: string;
  };
  realTimeInsights: {
    currentSession: {
      startTime: string;
      quotesViewed: number;
      currentMood: string;
      engagementLevel: number;
    };
    liveRecommendations: PredictiveRecommendation[];
    adaptiveUI: {
      suggestedTheme: string;
      suggestedLayout: string;
      suggestedContent: string[];
    };
  };
  advancedMetrics: {
    readingSpeed: number; // words per minute
    comprehensionScore: number;
    retentionRate: number;
    emotionalResponse: {
      beforeQuote: string;
      afterQuote: string;
      impact: number;
    };
  };
}

// ==================== COMPONENT PROPS ====================

export interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: PremiumTier['id'];
  featureRequested?: string;
  onUpgrade: (tier: PremiumTier['id']) => void;
}

export interface AISearchComponentProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: AISearchQuery) => void;
  searchHistory: AISearchQuery[];
  isPremium: boolean;
}

export interface ThemeCustomizerProps {
  currentTheme: CustomTheme;
  isPremium: boolean;
  onThemeChange: (theme: Partial<CustomTheme>) => void;
  onSave: (theme: CustomTheme) => void;
  onReset: () => void;
}

export interface AdvancedExportProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: PremiumTier['id'];
  onExport: (options: ExportOptions) => void;
}

export interface ContentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: AIContentGenerator) => void;
  generatedHistory: GeneratedContent[];
  isPremium: boolean;
}

export interface PremiumDashboardProps {
  subscription: UserSubscription;
  usage: UserSubscription['usage'];
  features: PremiumFeature[];
  onManageSubscription: () => void;
  onUpgrade: () => void;
}

// ==================== SERVICE INTERFACES ====================

export interface PremiumService {
  checkSubscription(userId: string): Promise<UserSubscription>;
  upgradeSubscription(userId: string, tier: PremiumTier['id']): Promise<boolean>;
  cancelSubscription(userId: string): Promise<boolean>;
  getUsage(userId: string): Promise<UserSubscription['usage']>;
  resetDailyUsage(userId: string): Promise<void>;
  validateFeatureAccess(userId: string, feature: string): Promise<boolean>;
}

export interface AIService {
  searchQuotes(query: AISearchQuery): Promise<AISearchResult[]>;
  analyzeSentiment(text: string): Promise<SentimentAnalysis>;
  generateContent(config: AIContentGenerator): Promise<GeneratedContent>;
  predictRecommendations(userId: string): Promise<PredictiveRecommendation[]>;
  processNaturalLanguage(query: string): Promise<{
    intent: string;
    entities: Record<string, any>;
    confidence: number;
  }>;
}

export interface ThemeService {
  getThemes(): Promise<CustomTheme[]>;
  saveTheme(theme: CustomTheme): Promise<boolean>;
  deleteTheme(themeId: string): Promise<boolean>;
  applyTheme(themeId: string): Promise<void>;
  exportTheme(themeId: string): Promise<string>;
  importTheme(themeData: string): Promise<CustomTheme>;
}

// ==================== ERROR TYPES ====================

export interface PremiumError extends Error {
  code: 'SUBSCRIPTION_EXPIRED' | 'FEATURE_NOT_AVAILABLE' | 'USAGE_LIMIT_EXCEEDED' | 'PAYMENT_FAILED';
  details: Record<string, any>;
}

export interface AIError extends Error {
  code: 'AI_SERVICE_UNAVAILABLE' | 'INVALID_QUERY' | 'RATE_LIMIT_EXCEEDED' | 'CONTENT_FILTERED';
  retryAfter?: number;
  details: Record<string, any>;
}
