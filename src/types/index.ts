// Types untuk Quote dari Indonesian Quotes API
export interface Quote {
  id: string;           // Unique identifier for each quote
  _id?: string;         // Legacy support for quotable format
  content: string;      // Quote text content
  author: string;       // Quote author name
  tags: string[];       // Auto-generated or manual tags
  authorSlug?: string;  // URL-friendly author name
  length?: number;      // Character length of content
  dateAdded?: string;   // When quote was added to system
  dateModified?: string; // Last modification date
  isFavorite?: boolean; // User's favorite status
  viewCount?: number;   // How many times viewed
}

// Types untuk future features (Phase 2+)
export interface UserQuote extends Omit<Quote, '_id'> {
  id: string;
  userId?: string;
  isCustom: boolean;
  isFavorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

// Future: User management types (Phase 3)
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  favorites: string[];
  customQuotes: string[];
  following: string[];
  followers: string[];
  createdAt: Date;
}

// Future: Social features (Phase 4)
export interface QuoteInteraction {
  id: string;
  quoteId: string;
  userId: string;
  type: 'like' | 'share' | 'comment';
  createdAt: Date;
}

export interface Comment {
  id: string;
  quoteId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
