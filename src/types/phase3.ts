/**
 * User Management System for InspirasiHub Phase 3
 * Handles user authentication, profiles, and social features
 */

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  joinDate: string;
  stats: {
    quotesShared: number;
    favoriteCount: number;
    followersCount: number;
    followingCount: number;
    totalLikes: number;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'id' | 'en';
    notifications: {
      newFollowers: boolean;
      quoteLikes: boolean;
      newQuotes: boolean;
    };
    privacy: {
      profilePublic: boolean;
      showStats: boolean;
      allowMessages: boolean;
    };
  };
  isVerified?: boolean;
  badges: string[];
}

export interface UserQuote {
  id: string;
  content: string;
  author: string;
  userId: string;
  username: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  likes: string[]; // Array of user IDs who liked
  comments: QuoteComment[];
  shares: number;
  reports: number;
  status: 'active' | 'pending' | 'archived' | 'deleted';
}

export interface QuoteComment {
  id: string;
  quoteId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: string[];
  replies: QuoteCommentReply[];
}

export interface QuoteCommentReply {
  id: string;
  commentId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: string[];
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'quote_approved';
  title: string;
  message: string;
  data?: any; // Additional data based on type (optional)
  read: boolean;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  creatorId: string;
  moderators: string[];
  members: string[];
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  stats: {
    memberCount: number;
    quoteCount: number;
    activityScore: number;
  };
}

export interface CommunityPost {
  id: string;
  communityId: string;
  userId: string;
  username: string;
  type: 'quote' | 'discussion' | 'poll';
  content: string;
  quoteId?: string; // If type is 'quote'
  tags: string[];
  likes: string[];
  comments: QuoteComment[];
  isPinned: boolean;
  createdAt: string;
}

// Storage keys for Phase 3
export const PHASE3_STORAGE_KEYS = {
  CURRENT_USER: 'inspirasi_current_user',
  USERS: 'inspirasi_users',
  USER_QUOTES: 'inspirasi_user_quotes',
  FOLLOWS: 'inspirasi_follows',
  NOTIFICATIONS: 'inspirasi_notifications',
  COMMUNITIES: 'inspirasi_communities',
  COMMUNITY_POSTS: 'inspirasi_community_posts',
  SOCIAL_INTERACTIONS: 'inspirasi_social_interactions'
} as const;
