import { Quote, QuoteCategory } from './index';

// Phase 2 Components - Blueprint untuk development selanjutnya

/**
 * CategoryFilter Component
 * Untuk filtering quote berdasarkan kategori
 */
export interface CategoryFilterProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

/**
 * FavoriteButton Component
 * Untuk menambah/menghapus quote dari favorites
 */
export interface FavoriteButtonProps {
  quote: Quote;
  isFavorite: boolean;
  onToggleFavorite: (quote: Quote) => void;
}

/**
 * QuoteHistory Component
 * Untuk menampilkan riwayat quote yang pernah dilihat
 */
export interface QuoteHistoryProps {
  history: Quote[];
  onSelectQuote: (quote: Quote) => void;
  onClearHistory: () => void;
}

/**
 * ShareButton Component
 * Untuk share quote ke social media
 */
export interface ShareButtonProps {
  quote: Quote;
  platforms: ('twitter' | 'facebook' | 'whatsapp' | 'copy')[];
}

/**
 * SearchBar Component
 * Untuk pencarian quote berdasar keyword/author
 */
export interface SearchBarProps {
  placeholder: string;
  onSearch: (query: string) => void;
  isLoading: boolean;
}

/**
 * QuoteGrid Component
 * Untuk menampilkan multiple quotes dalam grid layout
 */
export interface QuoteGridProps {
  quotes: Quote[];
  onQuoteSelect: (quote: Quote) => void;
  loading: boolean;
  error: string | null;
}

// Hook blueprints untuk Phase 2
export interface UseFavoritesHook {
  favorites: Quote[];
  addToFavorites: (quote: Quote) => void;
  removeFromFavorites: (quoteId: string) => void;
  isFavorite: (quoteId: string) => boolean;
  clearFavorites: () => void;
}

export interface UseQuoteHistoryHook {
  history: Quote[];
  addToHistory: (quote: Quote) => void;
  clearHistory: () => void;
  getRecentQuotes: (limit: number) => Quote[];
}

export interface UseQuoteCategoriesHook {
  categories: QuoteCategory[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  getQuotesByCategory: (category: string) => Promise<Quote[]>;
}

// Utility functions yang akan dibutuhkan di Phase 2
export interface ShareUtils {
  shareToTwitter: (quote: Quote) => void;
  shareToFacebook: (quote: Quote) => void;
  shareToWhatsApp: (quote: Quote) => void;
  copyToClipboard: (quote: Quote) => Promise<boolean>;
  generateShareText: (quote: Quote) => string;
}

export interface QuoteFilters {
  byCategory: (quotes: Quote[], category: string) => Quote[];
  byAuthor: (quotes: Quote[], author: string) => Quote[];
  byLength: (quotes: Quote[], minLength: number, maxLength: number) => Quote[];
  byKeyword: (quotes: Quote[], keyword: string) => Quote[];
}

// Analytics events untuk future tracking
export interface AnalyticsEvents {
  quoteViewed: (quote: Quote) => void;
  quoteFavorited: (quote: Quote) => void;
  quoteShared: (quote: Quote, platform: string) => void;
  categorySelected: (category: string) => void;
  searchPerformed: (query: string, results: number) => void;
}
