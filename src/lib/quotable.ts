import { Quote } from '@/types';

const QUOTES_INDONESIA_BASE_URL = 'https://raw.githubusercontent.com/lakuapik/quotes-indonesia/master/raw';

export class QuotesIndonesiaAPI {
  private static quotesCache: Quote[] | null = null;

  /**
   * Fetch all quotes and cache them
   */
  private static async fetchAllQuotes(): Promise<Quote[]> {
    if (this.quotesCache) {
      return this.quotesCache as Quote[];
    }

    const response = await fetch(`${QUOTES_INDONESIA_BASE_URL}/quotes.min.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch quotes: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform data to match our Quote interface
    this.quotesCache = data.map((item: any, index: number) => ({
      id: `quote-${index}`, // Unique identifier for each quote
      _id: `quote-${index}`, // Legacy support
      content: item.quote,
      author: item.by,
      tags: this.extractTagsFromContent(item.quote),
      authorSlug: this.slugify(item.by),
      length: item.quote.length,
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      viewCount: 0
    }));
    
    return this.quotesCache as Quote[];
  }

  /**
   * Extract potential tags from quote content
   */
  private static extractTagsFromContent(content: string): string[] {
    const tags = [];
    
    // Simple tag detection based on content keywords
    if (this.containsKeywords(content, ['bahagia', 'kebahagiaan', 'gembira', 'senang'])) {
      tags.push('kebahagiaan');
    }
    if (this.containsKeywords(content, ['cinta', 'kasih', 'sayang'])) {
      tags.push('cinta');
    }
    if (this.containsKeywords(content, ['sukses', 'berhasil', 'kemenangan', 'menang'])) {
      tags.push('sukses');
    }
    if (this.containsKeywords(content, ['hidup', 'kehidupan', 'masa depan'])) {
      tags.push('kehidupan');
    }
    if (this.containsKeywords(content, ['bijak', 'kebijaksanaan', 'arif'])) {
      tags.push('kebijaksanaan');
    }
    if (this.containsKeywords(content, ['bekerja', 'kerja', 'usaha', 'berusaha'])) {
      tags.push('kerja-keras');
    }
    if (this.containsKeywords(content, ['sabar', 'kesabaran', 'tekun', 'ketekunan'])) {
      tags.push('kesabaran');
    }
    if (this.containsKeywords(content, ['motivasi', 'semangat', 'inspirasi'])) {
      tags.push('motivasi');
    }
    
    // Default tag if no specific tags found
    if (tags.length === 0) {
      tags.push('inspirasi');
    }
    
    return tags;
  }

  /**
   * Check if content contains any of the keywords
   */
  private static containsKeywords(content: string, keywords: string[]): boolean {
    const lowerContent = content.toLowerCase();
    return keywords.some(keyword => lowerContent.includes(keyword));
  }

  /**
   * Create URL-friendly slug from text
   */
  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
  }

  /**
   * Fetch a random quote
   */
  static async getRandomQuote(): Promise<Quote> {
    const quotes = await this.fetchAllQuotes();
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }

  /**
   * Fetch a random quote by tag(s)
   */
  static async getRandomQuoteByTags(tags: string[]): Promise<Quote> {
    const quotes = await this.fetchAllQuotes();
    const filteredQuotes = quotes.filter(quote => 
      tags.some(tag => quote.tags.includes(tag))
    );
    
    if (filteredQuotes.length === 0) {
      // If no quotes match the tags, return a random quote
      return this.getRandomQuote();
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    return filteredQuotes[randomIndex];
  }

  /**
   * Fetch quotes by author
   */
  static async getQuotesByAuthor(author: string, limit: number = 10): Promise<Quote[]> {
    const quotes = await this.fetchAllQuotes();
    const authorQuotes = quotes.filter(quote => 
      quote.author.toLowerCase().includes(author.toLowerCase())
    );
    
    return authorQuotes.slice(0, limit);
  }

  /**
   * Search quotes by content
   */
  static async searchQuotes(query: string, limit: number = 10): Promise<Quote[]> {
    const quotes = await this.fetchAllQuotes();
    const searchResults = quotes.filter(quote =>
      quote.content.toLowerCase().includes(query.toLowerCase()) ||
      quote.author.toLowerCase().includes(query.toLowerCase())
    );
    
    return searchResults.slice(0, limit);
  }

  /**
   * Get available tags with quote counts
   */
  static async getTags(): Promise<Array<{ name: string; quoteCount: number }>> {
    const quotes = await this.fetchAllQuotes();
    const tagCounts: Record<string, number> = {};
    
    quotes.forEach(quote => {
      quote.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .map(([name, quoteCount]) => ({ name, quoteCount }))
      .sort((a, b) => b.quoteCount - a.quoteCount);
  }

  /**
   * Get quotes by tags/categories
   */
  static async getQuotesByTags(tags: string[], limit: number = 10): Promise<Quote[]> {
    const allQuotes = await this.fetchAllQuotes();
    const filteredQuotes = allQuotes.filter(quote =>
      tags.some(tag => quote.tags.some(quoteTag => 
        quoteTag.toLowerCase().includes(tag.toLowerCase())
      ))
    );
    return filteredQuotes.slice(0, limit);
  }

  /**
   * Get all quotes (public access)
   */
  static async getAllQuotes(): Promise<Quote[]> {
    return await this.fetchAllQuotes();
  }

  /**
   * Get all unique authors with quote counts
   */
  static async getAuthors(limit: number = 20): Promise<Array<{ name: string; quoteCount: number }>> {
    const quotes = await this.fetchAllQuotes();
    const authorCounts: Record<string, number> = {};
    
    quotes.forEach(quote => {
      authorCounts[quote.author] = (authorCounts[quote.author] || 0) + 1;
    });
    
    return Object.entries(authorCounts)
      .map(([name, quoteCount]) => ({ name, quoteCount }))
      .sort((a, b) => b.quoteCount - a.quoteCount)
      .slice(0, limit);
  }

  /**
   * Get total quote count
   */
  static async getTotalQuoteCount(): Promise<number> {
    const quotes = await this.fetchAllQuotes();
    return quotes.length;
  }

  /**
   * Clear cache (useful for development or data refresh)
   */
  static clearCache(): void {
    this.quotesCache = null;
  }
}

// Legacy export for backward compatibility
export const QuotableAPI = QuotesIndonesiaAPI;

// Future: Local storage utilities for Phase 2
export class LocalStorageUtils {
  /**
   * Save favorite quotes to localStorage
   */
  static saveFavorites(favorites: Quote[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('inspira-favorites', JSON.stringify(favorites));
    }
  }

  /**
   * Get favorite quotes from localStorage
   */
  static getFavorites(): Quote[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('inspira-favorites');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  /**
   * Add quote to favorites
   */
  static addToFavorites(quote: Quote): void {
    const favorites = this.getFavorites();
    const exists = favorites.find(fav => fav._id === quote._id);
    
    if (!exists) {
      favorites.push(quote);
      this.saveFavorites(favorites);
    }
  }

  /**
   * Remove quote from favorites
   */
  static removeFromFavorites(quoteId: string): void {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(fav => fav._id !== quoteId);
    this.saveFavorites(filtered);
  }

  /**
   * Check if quote is in favorites
   */
  static isFavorite(quoteId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav._id === quoteId);
  }

  /**
   * Save recent quotes history
   */
  static saveRecentQuotes(quotes: Quote[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('inspira-recent', JSON.stringify(quotes.slice(0, 20))); // Keep only last 20
    }
  }

  /**
   * Get recent quotes history
   */
  static getRecentQuotes(): Quote[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('inspira-recent');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  /**
   * Add quote to recent history
   */
  static addToRecentQuotes(quote: Quote): void {
    const recent = this.getRecentQuotes();
    
    // Remove if already exists to avoid duplicates
    const filtered = recent.filter(q => q._id !== quote._id);
    
    // Add to beginning of array
    filtered.unshift(quote);
    
    this.saveRecentQuotes(filtered);
  }
}
