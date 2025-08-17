/**
 * User Profile Component
 * Display user profile with stats, quotes, and social features
 */

'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/phase3';
import { UserSystem } from '@/lib/userSystem';
import { UserQuoteSystem } from '@/lib/userQuoteSystem';

interface UserProfileProps {
  userId: string;
  onClose?: () => void;
}

export default function UserProfile({ userId, onClose }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'quotes' | 'followers' | 'following'>('quotes');

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    
    const profileUser = UserSystem.getUserById(userId);
    const current = UserSystem.getCurrentUser();
    
    setUser(profileUser);
    setCurrentUser(current);
    
    if (current && profileUser) {
      setIsFollowing(UserSystem.isFollowing(current.id, userId));
    }
    
    setLoading(false);
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !user) return;
    
    setFollowLoading(true);
    
    try {
      if (isFollowing) {
        UserSystem.unfollowUser(currentUser.id, user.id);
        setIsFollowing(false);
      } else {
        UserSystem.followUser(currentUser.id, user.id);
        setIsFollowing(true);
      }
      
      // Reload user data to get updated stats
      setTimeout(() => {
        loadUserProfile();
      }, 100);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          User Tidak Ditemukan
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          User yang Anda cari tidak ada atau telah dihapus.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Kembali
          </button>
        )}
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === user.id;
  const userQuotes = UserQuoteSystem.getQuotesByUser(user.id, !!isOwnProfile);
  const followers = UserSystem.getFollowers(user.id);
  const following = UserSystem.getFollowing(user.id);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
      )}

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  {user.displayName}
                  {user.badges.includes('verified') && (
                    <span className="text-blue-500 text-sm">✓</span>
                  )}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
                {user.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mt-2">{user.bio}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Bergabung {new Date(user.joinDate).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && currentUser && (
                <div className="flex gap-3">
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`
                      px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50
                      ${isFollowing
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }
                    `}
                  >
                    {followLoading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      isFollowing ? 'Following' : 'Follow'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Badges */}
            {user.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {user.badges.map(badge => (
                  <span
                    key={badge}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                  >
                    {badge === 'verified' && '✓ Verified'}
                    {badge === 'top-contributor' && '🏆 Top Contributor'}
                    {badge === 'early-adopter' && '🚀 Early Adopter'}
                    {badge === 'new-member' && '🌟 New Member'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {user.stats.quotesShared}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Quotes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {user.stats.totalLikes}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Likes</div>
          </div>
          <div className="text-center cursor-pointer" onClick={() => setActiveTab('followers')}>
            <div className="text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-600 transition-colors">
              {user.stats.followersCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
          </div>
          <div className="text-center cursor-pointer" onClick={() => setActiveTab('following')}>
            <div className="text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-600 transition-colors">
              {user.stats.followingCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'quotes', label: 'Quotes', count: userQuotes.length },
            { id: 'followers', label: 'Followers', count: followers.length },
            { id: 'following', label: 'Following', count: following.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }
              `}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'quotes' && (
            <div className="space-y-4">
              {userQuotes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    {isOwnProfile ? 'Belum Ada Quote' : 'Belum Ada Quote Publik'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isOwnProfile ? 'Mulai buat quote inspiratif pertama Anda!' : 'User ini belum membagikan quote publik.'}
                  </p>
                </div>
              ) : (
                userQuotes.map(quote => (
                  <div key={quote.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <blockquote className="text-gray-800 dark:text-gray-200 italic mb-3">
                      "{quote.content}"
                    </blockquote>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>— {quote.author}</span>
                      <div className="flex items-center gap-4">
                        <span>❤️ {quote.likes.length}</span>
                        <span>💬 {quote.comments.length}</span>
                        <span>{new Date(quote.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {followers.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Belum Ada Followers
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isOwnProfile ? 'Bagikan quotes inspiratif untuk mendapatkan followers!' : 'User ini belum memiliki followers.'}
                  </p>
                </div>
              ) : (
                followers.map(follower => (
                  <div key={follower.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {follower.displayName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 dark:text-white">
                        {follower.displayName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        @{follower.username}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'following' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {following.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <div className="text-6xl mb-4">👤</div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Belum Mengikuti Siapapun
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isOwnProfile ? 'Mulai ikuti kreator inspiratif lainnya!' : 'User ini belum mengikuti siapapun.'}
                  </p>
                </div>
              ) : (
                following.map(followedUser => (
                  <div key={followedUser.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {followedUser.displayName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 dark:text-white">
                        {followedUser.displayName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        @{followedUser.username}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
