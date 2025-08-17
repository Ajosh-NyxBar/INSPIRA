/**
 * Community Feed Component
 * Displays public quotes from the community with social interactions
 */

'use client';

import { useState, useEffect } from 'react';
import { UserQuoteSystem } from '@/lib/userQuoteSystem';
import { UserSystem } from '@/lib/userSystem';
import { UserQuote, User } from '@/types/phase3';

interface CommunityFeedProps {
  currentUser: User | null;
  onProfileClick?: (userId: string) => void;
  onQuoteClick?: (quote: UserQuote) => void;
}

interface FeedQuote extends UserQuote {
  userProfile?: User | null;
}

type SortType = 'recent' | 'trending' | 'popular';

export default function CommunityFeed({ currentUser, onProfileClick, onQuoteClick }: CommunityFeedProps) {
  const [quotes, setQuotes] = useState<FeedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Comment states
  const [commentInputs, setCommentInputs] = useState<{ [quoteId: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [quoteId: string]: boolean }>({});
  const [commentUsers, setCommentUsers] = useState<{ [userId: string]: User | null }>({});

  // Load feed data
  useEffect(() => {
    loadFeed();
  }, [sortBy]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      let feedQuotes: UserQuote[] = [];
      
      switch (sortBy) {
        case 'trending':
          feedQuotes = await UserQuoteSystem.getTrendingQuotes();
          break;
        case 'popular':
          feedQuotes = await UserQuoteSystem.getTrendingQuotes(); // Use trending for now
          break;
        case 'recent':
        default:
          feedQuotes = await UserQuoteSystem.getPublicQuotes();
          break;
      }

      // Enrich with user profiles
      const enrichedQuotes: FeedQuote[] = await Promise.all(
        feedQuotes.map(async (quote) => {
          const userProfile = await UserSystem.getUserById(quote.userId);
          
          // Load comment users
          if (quote.comments && quote.comments.length > 0) {
            const commentUserPromises = quote.comments.map(async (comment) => {
              if (!commentUsers[comment.userId]) {
                const user = await UserSystem.getUserById(comment.userId);
                setCommentUsers(prev => ({ ...prev, [comment.userId]: user }));
              }
            });
            await Promise.all(commentUserPromises);
          }
          
          return {
            ...quote,
            userProfile
          };
        })
      );

      setQuotes(enrichedQuotes);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter quotes based on search and tags
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = !searchQuery || 
      quote.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.userProfile?.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || quote.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(quotes.flatMap(quote => quote.tags)));

  const handleLike = async (quoteId: string) => {
    if (!currentUser) return;
    
    try {
      const result = await UserQuoteSystem.toggleLike(quoteId);
      if (result.success) {
        // Reload the quote to get updated likes
        const updatedQuote = await UserQuoteSystem.getQuoteById(quoteId);
        if (updatedQuote) {
          setQuotes(prev => prev.map(quote => 
            quote.id === quoteId 
              ? { ...quote, likes: updatedQuote.likes }
              : quote
          ));
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (quoteId: string) => {
    if (!currentUser || !commentInputs[quoteId]?.trim()) return;
    
    try {
      const result = await UserQuoteSystem.addComment(quoteId, commentInputs[quoteId].trim());
      if (result.success) {
        // Reload the quote to get updated comments
        const updatedQuote = await UserQuoteSystem.getQuoteById(quoteId);
        if (updatedQuote) {
          setQuotes(prev => prev.map(quote => 
            quote.id === quoteId 
              ? { ...quote, comments: updatedQuote.comments }
              : quote
          ));
        }
        
        setCommentInputs(prev => ({ ...prev, [quoteId]: '' }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (quoteId: string) => {
    setShowComments(prev => ({ ...prev, [quoteId]: !prev[quoteId] }));
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes}m yang lalu`;
    if (hours < 24) return `${hours}j yang lalu`;
    return `${days}h yang lalu`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeletons */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
            <div className="flex space-x-4">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Community Feed 🌟
        </h2>
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari quotes, penulis, atau pengguna..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Sort Options */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: 'recent', label: 'Terbaru', icon: '🕐' },
              { id: 'trending', label: 'Trending', icon: '🔥' },
              { id: 'popular', label: 'Populer', icon: '❤️' }
            ].map(option => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id as SortType)}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${sortBy === option.id
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }
                `}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`
                  px-3 py-1 text-sm rounded-full transition-colors
                  ${!selectedTag
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }
                `}
              >
                Semua
              </button>
              {allTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`
                    px-3 py-1 text-sm rounded-full transition-colors
                    ${selectedTag === tag
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feed Content */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Tidak ada quotes ditemukan
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || selectedTag ? 'Coba ubah pencarian atau filter Anda' : 'Belum ada quotes di feed ini'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuotes.map(quote => (
            <div key={quote.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              {/* Quote Header */}
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onProfileClick?.(quote.userId)}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {quote.userProfile?.displayName.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {quote.userProfile?.displayName || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(quote.createdAt)}
                    </p>
                  </div>
                </div>
                
                {/* Quote Menu */}
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>

              {/* Quote Content */}
              <div 
                className="mb-4 cursor-pointer"
                onClick={() => onQuoteClick?.(quote)}
              >
                <blockquote className="text-lg text-gray-800 dark:text-white leading-relaxed mb-3 italic">
                  "{quote.content}"
                </blockquote>
                {quote.author && (
                  <p className="text-right text-gray-600 dark:text-gray-400 font-medium">
                    — {quote.author}
                  </p>
                )}
              </div>

              {/* Tags */}
              {quote.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {quote.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      onClick={() => setSelectedTag(tag)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Interaction Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-6">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(quote.id)}
                    disabled={!currentUser}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                      ${quote.likes.includes(currentUser?.id || '')
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }
                      ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <svg className="w-5 h-5" fill={quote.likes.includes(currentUser?.id || '') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{quote.likes.length}</span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => toggleComments(quote.id)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{quote.comments.length}</span>
                  </button>

                  {/* Share Button */}
                  <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>Bagikan</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[quote.id] && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  {/* Add Comment */}
                  {currentUser && (
                    <div className="flex space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {currentUser.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 flex space-x-2">
                        <input
                          type="text"
                          value={commentInputs[quote.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [quote.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleComment(quote.id)}
                          placeholder="Tulis komentar..."
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <button
                          onClick={() => handleComment(quote.id)}
                          disabled={!commentInputs[quote.id]?.trim()}
                          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                        >
                          Kirim
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-3">
                    {quote.comments.map(comment => {
                      const commentUser = commentUsers[comment.userId];
                      return (
                        <div key={comment.id} className="flex space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {commentUser?.displayName.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                              <p className="font-semibold text-sm text-gray-800 dark:text-white">
                                {commentUser?.displayName || 'Unknown User'}
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-3">
                              {formatTimeAgo(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
