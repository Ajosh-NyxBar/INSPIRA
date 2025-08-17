/**
 * Favorites Page Component
 * Menampilkan semua quotes yang difavoritkan oleh user
 */

'use client';

import { useState, useEffect } from 'react';
import { Quote } from '@/types';
import { getFavorites, removeFromFavorites, clearFavorites } from '@/lib/localStorage';
import FavoriteButton from './FavoriteButton';
import ShareButton from './ShareButton';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setLoading(true);
    const favs = getFavorites();
    setFavorites(favs);
    setLoading(false);
  };

  const handleRemoveFavorite = (quoteId: string) => {
    removeFromFavorites(quoteId);
    setFavorites(prev => prev.filter(quote => quote.id !== quoteId));
  };

  const handleClearAll = () => {
    clearFavorites();
    setFavorites([]);
    setShowConfirmClear(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Quotes Favorit ❤️
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {favorites.length} quote tersimpan dalam favorit Anda
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Hapus Semua
          </button>
        )}
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Belum Ada Quote Favorit
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Mulai jelajahi quotes inspiratif dan klik tombol ❤️ untuk menambahkannya ke favorit Anda.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Jelajahi Quotes
          </a>
        </div>
      ) : (
        /* Favorites Grid */
        <div className="grid gap-6 md:grid-cols-2">
          {favorites.map((quote, index) => (
            <div
              key={quote.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              {/* Quote Actions */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <FavoriteButton 
                    quote={quote} 
                    size="sm" 
                    onToggle={(isFavorited) => {
                      if (!isFavorited) {
                        handleRemoveFavorite(quote.id);
                      }
                    }}
                  />
                  <ShareButton quote={quote} size="sm" />
                </div>
                <div className="text-xs text-gray-500">
                  #{index + 1}
                </div>
              </div>

              {/* Quote Content */}
              <blockquote className="text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed mb-4 italic">
                "{quote.content}"
              </blockquote>

              {/* Author */}
              <cite className="text-gray-600 dark:text-gray-400 font-medium block mb-3">
                — {quote.author}
              </cite>

              {/* Tags */}
              {quote.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {quote.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {quote.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{quote.tags.length - 3} lainnya
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Hapus Semua Favorit?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Semua {favorites.length} quote favorit akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
