// Types untuk Quote dari Quotable API
export interface Quote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
  authorSlug: string;
  length: number;
  dateAdded?: string;
  dateModified?: string;
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
