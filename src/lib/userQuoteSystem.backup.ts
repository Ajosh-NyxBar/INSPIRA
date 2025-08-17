/**
 * User Quote System for InspirasiHub Phase 3
 * Handles custom quotes created by users, interactions, and community features
 */

import { UserQuote, QuoteComment, QuoteCommentReply, PHASE3_STORAGE_KEYS } from '@/types/phase3';
import { UserSystem } from './userSystem';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function safeSaveJSON(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

export class UserQuoteSystem {
  /**
   * Create new user quote
   */
  static createQuote(quoteData: {
    content: string;
    author: string;
    tags: string[];
    isPublic: boolean;
  }): { success: boolean; quote?: UserQuote; error?: string } {
    try {
      const currentUser = UserSystem.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Anda harus login untuk membuat quote' };
      }
      
      // Validate content
      if (!quoteData.content.trim()) {
        return { success: false, error: 'Konten quote tidak boleh kosong' };
      }
      
      if (quoteData.content.length > 500) {
        return { success: false, error: 'Konten quote maksimal 500 karakter' };
      }
      
      // Create new quote
      const newQuote: UserQuote = {
        id: generateId(),
        content: quoteData.content.trim(),
        author: quoteData.author.trim() || currentUser.displayName,
        userId: currentUser.id,
        username: currentUser.username,
        tags: quoteData.tags.filter(tag => tag.trim().length > 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: quoteData.isPublic,
        likes: [],
        comments: [],
        shares: 0,
        reports: 0,
        status: 'active'
      };
      
      // Save quote
      const quotes = this.getAllUserQuotes();
      quotes.push(newQuote);
      safeSaveJSON(PHASE3_STORAGE_KEYS.USER_QUOTES, quotes);
      
      // Update user stats
      this.updateUserQuoteStats(currentUser.id, { quotesShared: 1 });
      
      return { success: true, quote: newQuote };
    } catch (error) {
      return { success: false, error: 'Gagal membuat quote. Silakan coba lagi.' };
    }
  }
  
  /**
   * Update user quote
   */
  static updateQuote(quoteId: string, updates: Partial<UserQuote>): boolean {
    const quotes = this.getAllUserQuotes();
    const quoteIndex = quotes.findIndex(q => q.id === quoteId);
    
    if (quoteIndex === -1) return false;
    
    const currentUser = UserSystem.getCurrentUser();
    if (!currentUser || quotes[quoteIndex].userId !== currentUser.id) {
      return false; // Only owner can update
    }
    
    // Update quote
    quotes[quoteIndex] = { 
      ...quotes[quoteIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    
    return safeSaveJSON(PHASE3_STORAGE_KEYS.USER_QUOTES, quotes);
  }
  
  /**
   * Delete user quote
   */
  static deleteQuote(quoteId: string): boolean {
    const quotes = this.getAllUserQuotes();
    const quoteIndex = quotes.findIndex(q => q.id === quoteId);
    
    if (quoteIndex === -1) return false;
    
    const currentUser = UserSystem.getCurrentUser();
    if (!currentUser || quotes[quoteIndex].userId !== currentUser.id) {
      return false; // Only owner can delete
    }
    
    // Soft delete
    quotes[quoteIndex].status = 'deleted';
    quotes[quoteIndex].updatedAt = new Date().toISOString();
    
    // Update user stats
    this.updateUserQuoteStats(currentUser.id, { quotesShared: -1 });
    
    return safeSaveJSON(PHASE3_STORAGE_KEYS.USER_QUOTES, quotes);
  }
  
  /**
   * Get all user quotes (active only)
   */
  static getAllUserQuotes(): UserQuote[] {
    const stored = localStorage.getItem(PHASE3_STORAGE_KEYS.USER_QUOTES);
    return safeParseJSON(stored, []);
  }
  
  /**
   * Get public quotes with pagination
   */
  static getPublicQuotes(page: number = 1, limit: number = 20): UserQuote[] {
    const quotes = this.getAllUserQuotes();
    const publicQuotes = quotes
      .filter(q => q.isPublic && q.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const startIndex = (page - 1) * limit;
    return publicQuotes.slice(startIndex, startIndex + limit);
  }
  
  /**
   * Get quotes by user
   */
  static getQuotesByUser(userId: string, includePrivate: boolean = false): UserQuote[] {
    const quotes = this.getAllUserQuotes();
    const currentUser = UserSystem.getCurrentUser();
    
    return quotes
      .filter(q => {
        if (q.userId !== userId || q.status !== 'active') return false;
        if (!includePrivate && !q.isPublic) {
          return currentUser && currentUser.id === userId; // Owner can see private
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  /**
   * Search quotes
   */
  static searchQuotes(query: string, filters?: {
    tags?: string[];
    userId?: string;
    publicOnly?: boolean;
  }): UserQuote[] {
    const quotes = this.getAllUserQuotes();
    const lowercaseQuery = query.toLowerCase();
    
    return quotes.filter(quote => {
      // Status check
      if (quote.status !== 'active') return false;
      
      // Public only filter
      if (filters?.publicOnly && !quote.isPublic) return false;
      
      // User filter
      if (filters?.userId && quote.userId !== filters.userId) return false;
      
      // Tags filter
      if (filters?.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          quote.tags.some(quoteTag => 
            quoteTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }
      
      // Text search
      return (
        quote.content.toLowerCase().includes(lowercaseQuery) ||
        quote.author.toLowerCase().includes(lowercaseQuery) ||
        quote.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  /**
   * Get quote by ID
   */
  static getQuoteById(quoteId: string): UserQuote | null {
    const quotes = this.getAllUserQuotes();
    return quotes.find(q => q.id === quoteId && q.status === 'active') || null;
  }
  
  // =============================================================================
  // LIKE SYSTEM
  // =============================================================================
  
  /**
   * Toggle like on quote
   */
  static toggleLike(quoteId: string): { success: boolean; isLiked: boolean; error?: string } {
    try {
      const currentUser = UserSystem.getCurrentUser();
      if (!currentUser) {
        return { success: false, isLiked: false, error: 'Anda harus login untuk menyukai quote' };
      }
      
      const quotes = this.getAllUserQuotes();
      const quoteIndex = quotes.findIndex(q => q.id === quoteId);
      
      if (quoteIndex === -1) {
        return { success: false, isLiked: false, error: 'Quote tidak ditemukan' };
      }
      
      const quote = quotes[quoteIndex];
      const userIdIndex = quote.likes.indexOf(currentUser.id);
      let isLiked: boolean;
      
      if (userIdIndex > -1) {
        // Unlike
        quote.likes.splice(userIdIndex, 1);
        isLiked = false;
        
        // Update quote author stats
        this.updateUserQuoteStats(quote.userId, { totalLikes: -1 });
      } else {
        // Like
        quote.likes.push(currentUser.id);
        isLiked = true;
        
        // Update quote author stats
        this.updateUserQuoteStats(quote.userId, { totalLikes: 1 });
        
        // Create notification for quote author
        if (quote.userId !== currentUser.id) {
          UserSystem.createNotification(quote.userId, {
            type: 'like',
            title: 'Quote Disukai!',
            message: `${currentUser.displayName} menyukai quote Anda: "${quote.content.substring(0, 50)}..."`,
            data: { quoteId, likerId: currentUser.id }
          });
        }
      }
      
      quotes[quoteIndex] = quote;
      safeSaveJSON(PHASE3_STORAGE_KEYS.USER_QUOTES, quotes);
      
      return { success: true, isLiked };
    } catch (error) {
      return { success: false, isLiked: false, error: 'Gagal memproses like' };
    }
  }
  
  /**
   * Get likes for quote
   */
  static getQuoteLikes(quoteId: string): { count: number; users: Array<{ id: string; username: string; displayName: string }> } {
    const quote = this.getQuoteById(quoteId);
    if (!quote) return { count: 0, users: [] };
    
    const users = quote.likes
      .map(userId => UserSystem.getUserById(userId))
      .filter((user): user is NonNullable<typeof user> => user !== null)
      .map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName
      }));
    
    return { count: quote.likes.length, users };
  }
  
  // =============================================================================
  // COMMENT SYSTEM
  // =============================================================================
  
  /**
   * Add comment to quote
   */
  static addComment(quoteId: string, content: string): { success: boolean; comment?: QuoteComment; error?: string } {
    try {
      const currentUser = UserSystem.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Anda harus login untuk berkomentar' };
      }
      
      if (!content.trim()) {
        return { success: false, error: 'Komentar tidak boleh kosong' };
      }
      
      if (content.length > 300) {
        return { success: false, error: 'Komentar maksimal 300 karakter' };
      }
      
      const quotes = this.getAllUserQuotes();
      const quoteIndex = quotes.findIndex(q => q.id === quoteId);
      
      if (quoteIndex === -1) {
        return { success: false, error: 'Quote tidak ditemukan' };
      }
      
      const newComment: QuoteComment = {
        id: generateId(),
        quoteId,
        userId: currentUser.id,
        username: currentUser.username,
        userAvatar: currentUser.avatar,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        likes: [],
        replies: []
      };
      
      quotes[quoteIndex].comments.push(newComment);
      safeSaveJSON(PHASE3_STORAGE_KEYS.USER_QUOTES, quotes);
      
      // Create notification for quote author
      const quote = quotes[quoteIndex];
      if (quote.userId !== currentUser.id) {
        UserSystem.createNotification(quote.userId, {
          type: 'comment',
          title: 'Komentar Baru!',
          message: `${currentUser.displayName} berkomentar di quote Anda: "${content.substring(0, 50)}..."`,
          data: { quoteId, commentId: newComment.id, commenterId: currentUser.id }
        });
      }
      
      return { success: true, comment: newComment };
    } catch (error) {
      return { success: false, error: 'Gagal menambahkan komentar' };
    }
  }
  
  /**
   * Get trending quotes (most liked in last 7 days)
   */
  static getTrendingQuotes(limit: number = 10): UserQuote[] {
    const quotes = this.getAllUserQuotes();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return quotes
      .filter(q => {
        return q.isPublic && 
               q.status === 'active' && 
               new Date(q.createdAt) > sevenDaysAgo;
      })
      .sort((a, b) => {
        // Sort by like count, then by recency
        const likeDiff = b.likes.length - a.likes.length;
        if (likeDiff !== 0) return likeDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, limit);
  }
  
  /**
   * Get recommended quotes for user
   */
  static getRecommendedQuotes(userId: string, limit: number = 10): UserQuote[] {
    const user = UserSystem.getCurrentUser();
    if (!user) return this.getPublicQuotes(1, limit);
    
    // Get user's liked quotes to understand preferences
    const allQuotes = this.getAllUserQuotes();
    const likedQuotes = allQuotes.filter(q => q.likes.includes(userId));
    
    // Extract preferred tags from liked quotes
    const tagFrequency: Record<string, number> = {};
    likedQuotes.forEach(quote => {
      quote.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });
    
    const preferredTags = Object.entries(tagFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
    
    // Get quotes matching preferred tags
    const recommendations = allQuotes
      .filter(q => {
        return q.isPublic && 
               q.status === 'active' && 
               q.userId !== userId && // Don't recommend own quotes
               !q.likes.includes(userId) && // Don't recommend already liked quotes
               q.tags.some(tag => preferredTags.includes(tag));
      })
      .sort((a, b) => {
        // Sort by relevance (tag match count) and likes
        const aRelevance = a.tags.filter(tag => preferredTags.includes(tag)).length;
        const bRelevance = b.tags.filter(tag => preferredTags.includes(tag)).length;
        
        if (aRelevance !== bRelevance) return bRelevance - aRelevance;
        return b.likes.length - a.likes.length;
      })
      .slice(0, limit);
    
    // If not enough recommendations, fill with popular quotes
    if (recommendations.length < limit) {
      const popularQuotes = this.getTrendingQuotes(limit - recommendations.length);
      const additionalQuotes = popularQuotes.filter(q => 
        !recommendations.some(r => r.id === q.id) && 
        q.userId !== userId &&
        !q.likes.includes(userId)
      );
      recommendations.push(...additionalQuotes);
    }
    
    return recommendations.slice(0, limit);
  }
  
  // =============================================================================
  // HELPER METHODS
  // =============================================================================
  
  /**
   * Update user quote stats
   */
  private static updateUserQuoteStats(userId: string, statChanges: Partial<{ quotesShared: number; totalLikes: number }>): void {
    const user = UserSystem.getUserById(userId);
    if (!user) return;
    
    const updatedStats = { ...user.stats };
    
    Object.entries(statChanges).forEach(([key, value]) => {
      if (typeof value === 'number') {
        (updatedStats as any)[key] = Math.max(0, (updatedStats as any)[key] + value);
      }
    });
    
    UserSystem.updateProfile(userId, { stats: updatedStats });
  }
  
  /**
   * Initialize demo quotes
   */
  static initializeDemoQuotes(): void {
    const quotes = this.getAllUserQuotes();
    
    if (quotes.length === 0) {
      const demoQuotes: UserQuote[] = [
        {
          id: 'demo-quote-1',
          content: 'Kebahagiaan bukan tujuan, melainkan cara hidup. Mulailah dari hal-hal kecil yang bisa membuat hari ini lebih bermakna.',
          author: 'Inspirator Utama',
          userId: 'demo-user-1',
          username: 'inspirator',
          tags: ['kebahagiaan', 'motivasi', 'kehidupan'],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isPublic: true,
          likes: [],
          comments: [],
          shares: 5,
          reports: 0,
          status: 'active'
        }
      ];
      
      safeSaveJSON(PHASE3_STORAGE_KEYS.USER_QUOTES, demoQuotes);
    }
  }
}
