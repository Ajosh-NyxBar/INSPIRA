/**
 * User Quote System Integration with Firebase
 * Wraps Firebase quote services for easier usage
 */

import { firebaseQuoteService } from './firebaseQuoteService';
import { UserQuote, QuoteComment } from '@/types/phase3';

export class UserQuoteSystem {
  static async createQuote(quoteData: {
    content: string;
    author: string;
    tags: string[];
    isPublic: boolean;
  }): Promise<{ success: boolean; quote?: UserQuote; error?: string }> {
    return firebaseQuoteService.createQuote(quoteData);
  }

  static async getPublicQuotes(): Promise<UserQuote[]> {
    return firebaseQuoteService.getPublicQuotes();
  }

  static async getTrendingQuotes(): Promise<UserQuote[]> {
    return firebaseQuoteService.getTrendingQuotes();
  }

  static async getUserQuotes(userId: string): Promise<UserQuote[]> {
    return firebaseQuoteService.getUserQuotes(userId);
  }

  static async getQuoteById(quoteId: string): Promise<UserQuote | null> {
    return firebaseQuoteService.getQuoteById(quoteId);
  }

  static async toggleLike(quoteId: string): Promise<{ success: boolean; isLiked: boolean; error?: string }> {
    return firebaseQuoteService.toggleLike(quoteId);
  }

  static async addComment(quoteId: string, content: string): Promise<{ success: boolean; comment?: QuoteComment; error?: string }> {
    return firebaseQuoteService.addComment(quoteId, content);
  }

  static async deleteQuote(quoteId: string): Promise<{ success: boolean; error?: string }> {
    return firebaseQuoteService.deleteQuote(quoteId);
  }

  // Helper methods for compatibility
  static getRecommendedQuotes(): UserQuote[] {
    // This would typically use ML algorithms
    // For now, return empty array - should be fetched async
    return [];
  }

  static async getRecommendedQuotesAsync(): Promise<UserQuote[]> {
    // Get trending quotes as recommendations
    return firebaseQuoteService.getTrendingQuotes();
  }
}
