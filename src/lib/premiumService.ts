/**
 * Premium Service - Phase 5
 * Manages subscription system, premium features, and usage tracking
 * Date: August 17, 2025
 */

import { 
  PremiumTier, 
  UserSubscription, 
  PremiumFeature, 
  PremiumError,
  PremiumService as IPremiumService
} from '../types/phase5';

class PremiumService implements IPremiumService {
  private static instance: PremiumService;
  private storageKey = 'inspira_premium_data';

  static getInstance(): PremiumService {
    if (!PremiumService.instance) {
      PremiumService.instance = new PremiumService();
    }
    return PremiumService.instance;
  }

  // ==================== PREMIUM TIERS ====================

  private premiumTiers: PremiumTier[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Sempurna untuk memulai perjalanan inspirasi Anda',
      price: {
        monthly: 0,
        yearly: 0,
        currency: 'IDR'
      },
      features: [
        {
          id: 'basic_quotes',
          name: 'Quote Generator Dasar',
          description: 'Akses ke koleksi quote inspiratif',
          icon: '💬',
          category: 'analytics',
          requiresTier: 'premium'
        },
        {
          id: 'basic_favorites',
          name: 'Simpan Favorit',
          description: 'Simpan quote favorit Anda',
          icon: '❤️',
          category: 'analytics',
          requiresTier: 'premium'
        },
        {
          id: 'basic_sharing',
          name: 'Berbagi Quote',
          description: 'Bagikan quote ke sosial media',
          icon: '📤',
          category: 'analytics',
          requiresTier: 'premium'
        }
      ],
      limits: {
        dailyQuotes: 50,
        analyticsHistory: 7,
        customThemes: 0,
        aiRequests: 0,
        exportFormats: ['json']
      }
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Unlock fitur premium untuk pengalaman yang lebih personal',
      price: {
        monthly: 29000,
        yearly: 299000,
        currency: 'IDR'
      },
      features: [
        {
          id: 'unlimited_quotes',
          name: 'Quote Tak Terbatas',
          description: 'Akses unlimited ke semua quote',
          icon: '🚀',
          category: 'analytics',
          requiresTier: 'premium'
        },
        {
          id: 'advanced_analytics',
          name: 'Analytics Premium',
          description: 'Insight mendalam tentang pola baca Anda',
          icon: '📊',
          category: 'analytics',
          requiresTier: 'premium'
        },
        {
          id: 'custom_themes',
          name: 'Tema Kustom',
          description: 'Personalisasi tampilan aplikasi',
          icon: '🎨',
          category: 'customization',
          requiresTier: 'premium'
        },
        {
          id: 'ai_search',
          name: 'AI Search',
          description: 'Pencarian cerdas dengan AI',
          icon: '🔍',
          category: 'ai',
          requiresTier: 'premium'
        },
        {
          id: 'export_premium',
          name: 'Export Premium',
          description: 'Export ke PDF, DOCX, dan format lainnya',
          icon: '📄',
          category: 'export',
          requiresTier: 'premium'
        }
      ],
      limits: {
        dailyQuotes: 500,
        analyticsHistory: 90,
        customThemes: 10,
        aiRequests: 100,
        exportFormats: ['json', 'pdf', 'docx', 'csv']
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Untuk power user yang menginginkan semua fitur terdepan',
      price: {
        monthly: 59000,
        yearly: 599000,
        currency: 'IDR'
      },
      features: [
        {
          id: 'ai_content_generator',
          name: 'AI Content Generator',
          description: 'Generate quote personal dengan AI',
          icon: '🤖',
          category: 'ai',
          requiresTier: 'pro'
        },
        {
          id: 'sentiment_analysis',
          name: 'Sentiment Analysis',
          description: 'Analisis emosi dari quote',
          icon: '😊',
          category: 'ai',
          requiresTier: 'pro'
        },
        {
          id: 'predictive_recommendations',
          name: 'Predictive AI',
          description: 'Rekomendasi prediktif berbasis AI',
          icon: '🔮',
          category: 'ai',
          requiresTier: 'pro'
        },
        {
          id: 'unlimited_themes',
          name: 'Unlimited Themes',
          description: 'Buat tema kustom tanpa batas',
          icon: '🌈',
          category: 'customization',
          requiresTier: 'pro'
        },
        {
          id: 'priority_support',
          name: 'Priority Support',
          description: 'Dukungan prioritas 24/7',
          icon: '🎯',
          category: 'support',
          requiresTier: 'pro'
        },
        {
          id: 'advanced_export',
          name: 'Advanced Export',
          description: 'Export dengan custom template',
          icon: '📋',
          category: 'export',
          requiresTier: 'pro'
        }
      ],
      limits: {
        dailyQuotes: -1, // unlimited
        analyticsHistory: 365,
        customThemes: -1, // unlimited
        aiRequests: 1000,
        exportFormats: ['json', 'pdf', 'docx', 'csv', 'epub', 'image']
      }
    }
  ];

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  async checkSubscription(userId: string): Promise<UserSubscription> {
    try {
      const data = this.getStoredData();
      const subscription = data.subscriptions?.[userId];
      
      if (!subscription) {
        // Create default free subscription
        const defaultSubscription: UserSubscription = {
          userId,
          tier: 'free',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: false,
          usage: {
            dailyQuotesUsed: 0,
            aiRequestsUsed: 0,
            lastResetDate: new Date().toISOString().split('T')[0]
          }
        };
        
        this.saveSubscription(defaultSubscription);
        return defaultSubscription;
      }

      // Check if subscription is expired
      if (new Date(subscription.endDate) < new Date() && subscription.tier !== 'free') {
        subscription.status = 'expired';
        subscription.tier = 'free';
        this.saveSubscription(subscription);
      }

      // Reset daily usage if needed
      const today = new Date().toISOString().split('T')[0];
      if (subscription.usage.lastResetDate !== today) {
        subscription.usage.dailyQuotesUsed = 0;
        subscription.usage.aiRequestsUsed = 0;
        subscription.usage.lastResetDate = today;
        this.saveSubscription(subscription);
      }

      return subscription;
    } catch (error) {
      console.error('Error checking subscription:', error);
      throw new Error('Failed to check subscription');
    }
  }

  async upgradeSubscription(userId: string, tier: PremiumTier['id']): Promise<boolean> {
    try {
      const currentSubscription = await this.checkSubscription(userId);
      const targetTier = this.premiumTiers.find(t => t.id === tier);
      
      if (!targetTier) {
        throw new Error('Invalid subscription tier');
      }

      // Simulate payment processing
      await this.simulatePayment(targetTier);

      const updatedSubscription: UserSubscription = {
        ...currentSubscription,
        tier,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        autoRenew: true,
        paymentMethod: {
          type: 'card',
          last4: '1234',
          expiryDate: '12/25'
        }
      };

      this.saveSubscription(updatedSubscription);
      
      // Track upgrade event
      this.trackSubscriptionEvent('upgrade', userId, tier);
      
      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return false;
    }
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.checkSubscription(userId);
      
      subscription.status = 'cancelled';
      subscription.autoRenew = false;
      
      this.saveSubscription(subscription);
      this.trackSubscriptionEvent('cancel', userId, subscription.tier);
      
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }

  async getUsage(userId: string): Promise<UserSubscription['usage']> {
    const subscription = await this.checkSubscription(userId);
    return subscription.usage;
  }

  async resetDailyUsage(userId: string): Promise<void> {
    const subscription = await this.checkSubscription(userId);
    subscription.usage.dailyQuotesUsed = 0;
    subscription.usage.aiRequestsUsed = 0;
    subscription.usage.lastResetDate = new Date().toISOString().split('T')[0];
    this.saveSubscription(subscription);
  }

  async validateFeatureAccess(userId: string, feature: string): Promise<boolean> {
    try {
      const subscription = await this.checkSubscription(userId);
      const userTier = this.premiumTiers.find(t => t.id === subscription.tier);
      
      if (!userTier) return false;

      // Check if feature exists in user's tier
      const hasFeature = userTier.features.some(f => f.id === feature);
      
      // Check usage limits
      if (feature.includes('ai') && userTier.limits.aiRequests > 0) {
        return subscription.usage.aiRequestsUsed < userTier.limits.aiRequests;
      }
      
      if (feature.includes('quote') && userTier.limits.dailyQuotes > 0) {
        return subscription.usage.dailyQuotesUsed < userTier.limits.dailyQuotes;
      }

      return hasFeature;
    } catch (error) {
      console.error('Error validating feature access:', error);
      return false;
    }
  }

  // ==================== USAGE TRACKING ====================

  async trackUsage(userId: string, feature: 'quote' | 'ai'): Promise<void> {
    try {
      const subscription = await this.checkSubscription(userId);
      
      if (feature === 'quote') {
        subscription.usage.dailyQuotesUsed++;
      } else if (feature === 'ai') {
        subscription.usage.aiRequestsUsed++;
      }
      
      this.saveSubscription(subscription);
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }

  async checkUsageLimit(userId: string, feature: 'quote' | 'ai'): Promise<boolean> {
    try {
      const subscription = await this.checkSubscription(userId);
      const tier = this.premiumTiers.find(t => t.id === subscription.tier);
      
      if (!tier) return false;

      if (feature === 'quote') {
        return tier.limits.dailyQuotes === -1 || 
               subscription.usage.dailyQuotesUsed < tier.limits.dailyQuotes;
      } else if (feature === 'ai') {
        return tier.limits.aiRequests === -1 || 
               subscription.usage.aiRequestsUsed < tier.limits.aiRequests;
      }

      return true;
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return false;
    }
  }

  // ==================== PREMIUM TIERS MANAGEMENT ====================

  getPremiumTiers(): PremiumTier[] {
    return this.premiumTiers;
  }

  getTierByid(tierId: PremiumTier['id']): PremiumTier | undefined {
    return this.premiumTiers.find(tier => tier.id === tierId);
  }

  getFeaturesByTier(tierId: PremiumTier['id']): PremiumFeature[] {
    const tier = this.getTierByid(tierId);
    return tier?.features || [];
  }

  // ==================== STORAGE MANAGEMENT ====================

  private getStoredData(): any {
    if (typeof window === 'undefined') return {};
    
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading premium data:', error);
      return {};
    }
  }

  private saveStoredData(data: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving premium data:', error);
    }
  }

  private saveSubscription(subscription: UserSubscription): void {
    const data = this.getStoredData();
    if (!data.subscriptions) data.subscriptions = {};
    data.subscriptions[subscription.userId] = subscription;
    this.saveStoredData(data);
  }

  // ==================== HELPER METHODS ====================

  private async simulatePayment(tier: PremiumTier): Promise<void> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 95% success rate
    if (Math.random() < 0.05) {
      throw new Error('Payment failed');
    }
  }

  private trackSubscriptionEvent(event: string, userId: string, tier: string): void {
    // Track subscription events for analytics
    const eventData = {
      event: `subscription_${event}`,
      userId,
      tier,
      timestamp: new Date().toISOString()
    };
    
    // Store in analytics
    const data = this.getStoredData();
    if (!data.events) data.events = [];
    data.events.push(eventData);
    this.saveStoredData(data);
  }

  // ==================== PREMIUM FEATURE CHECKS ====================

  async canAccessAdvancedAnalytics(userId: string): Promise<boolean> {
    return this.validateFeatureAccess(userId, 'advanced_analytics');
  }

  async canUseAIFeatures(userId: string): Promise<boolean> {
    return this.validateFeatureAccess(userId, 'ai_search');
  }

  async canCreateCustomThemes(userId: string): Promise<boolean> {
    return this.validateFeatureAccess(userId, 'custom_themes');
  }

  async canExportPremium(userId: string): Promise<boolean> {
    return this.validateFeatureAccess(userId, 'export_premium');
  }

  async getAvailableExportFormats(userId: string): Promise<string[]> {
    const subscription = await this.checkSubscription(userId);
    const tier = this.getTierByid(subscription.tier);
    return tier?.limits.exportFormats || ['json'];
  }

  // ==================== TRIAL MANAGEMENT ====================

  async startFreeTrial(userId: string): Promise<boolean> {
    try {
      const subscription = await this.checkSubscription(userId);
      
      if (subscription.tier !== 'free') {
        throw new Error('User already has premium subscription');
      }

      const trialSubscription: UserSubscription = {
        ...subscription,
        tier: 'premium',
        status: 'trial',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial
        autoRenew: false
      };

      this.saveSubscription(trialSubscription);
      this.trackSubscriptionEvent('trial_start', userId, 'premium');
      
      return true;
    } catch (error) {
      console.error('Error starting free trial:', error);
      return false;
    }
  }

  async isTrialActive(userId: string): Promise<boolean> {
    const subscription = await this.checkSubscription(userId);
    return subscription.status === 'trial' && new Date(subscription.endDate) > new Date();
  }

  // ==================== SUBSCRIPTION ANALYTICS ====================

  getSubscriptionStats(): any {
    const data = this.getStoredData();
    const subscriptions = data.subscriptions || {};
    
    const stats = {
      total: Object.keys(subscriptions).length,
      free: 0,
      premium: 0,
      pro: 0,
      trial: 0,
      active: 0,
      expired: 0
    };

    Object.values(subscriptions).forEach((sub: any) => {
      stats[sub.tier as keyof typeof stats]++;
      stats[sub.status as keyof typeof stats]++;
    });

    return stats;
  }
}

export default PremiumService;
