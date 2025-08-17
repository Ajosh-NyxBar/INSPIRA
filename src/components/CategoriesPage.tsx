/**
 * Categories Page Component
 * Halaman untuk filtering quotes berdasarkan kategori/tags
 */

'use client';

import { useState, useEffect } from 'react';
import { Quote } from '@/types';
import { QuotableAPI } from '@/lib/quotable';
import { QUOTE_CATEGORIES } from '@/lib/constants';
import { addToHistory, addToFavorites } from '@/lib/localStorage';
import FavoriteButton from './FavoriteButton';
import ShareButton from './ShareButton';

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<Array<{ name: string; quoteCount: number }>>([]);

  useEffect(() => {
    loadAvailableTags();
  }, []);

  const loadAvailableTags = async () => {
    try {
      const tags = await QuotableAPI.getTags();
      setAvailableTags(tags);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const handleCategorySelect = async (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setLoading(true);
    setError(null);
    
    try {
      const categoryQuotes = await QuotableAPI.getQuotesByTags([categorySlug], 10);
      setQuotes(categoryQuotes);
      
      // Add first quote to history
      if (categoryQuotes.length > 0) {
        addToHistory(categoryQuotes[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat quotes');
    } finally {
      setLoading(false);
    }
  };

  const getRandomQuoteFromCategory = async () => {
    if (!selectedCategory) return;
    
    setLoading(true);
    try {
      const allQuotes = await QuotableAPI.getAllQuotes();
      const categoryQuotes = allQuotes.filter(quote => 
        quote.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
      
      if (categoryQuotes.length > 0) {
        const randomQuote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
        addToHistory(randomQuote);
        setQuotes([randomQuote, ...quotes.filter(q => q.id !== randomQuote.id)]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Kategori Inspirasi 🏷️
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Jelajahi quotes berdasarkan topik yang Anda minati
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {QUOTE_CATEGORIES.map((category) => {
          const tagData = availableTags.find(tag => tag.name.toLowerCase() === category.name.toLowerCase());
          const isSelected = selectedCategory === category.slug;
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.slug)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                }
              `}
            >
              <div className="font-semibold text-sm mb-1">{category.name}</div>
              {tagData && (
                <div className="text-xs text-gray-500">
                  {tagData.quoteCount} quotes
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Category Content */}
      {selectedCategory && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          {/* Category Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Kategori: {QUOTE_CATEGORIES.find(cat => cat.slug === selectedCategory)?.name || selectedCategory}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {quotes.length} quote ditemukan
              </p>
            </div>
            
            <button
              onClick={getRandomQuoteFromCategory}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors text-sm"
            >
              {loading ? 'Memuat...' : 'Quote Acak ✨'}
            </button>
          </div>

          {/* Loading State */}
          {loading && quotes.length === 0 && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400">
                <p className="font-semibold mb-2">Terjadi Kesalahan</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => handleCategorySelect(selectedCategory)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

          {/* Quotes List */}
          {quotes.length > 0 && (
            <div className="space-y-6">
              {quotes.map((quote, index) => (
                <div
                  key={quote.id}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  {/* Quote Actions */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <FavoriteButton quote={quote} size="sm" />
                      <ShareButton quote={quote} size="sm" />
                    </div>
                    <div className="text-xs text-gray-500">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Quote Content */}
                  <blockquote className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed mb-4 italic">
                    "{quote.content}"
                  </blockquote>

                  {/* Author and Tags */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <cite className="text-gray-600 dark:text-gray-400 font-medium">
                      — {quote.author}
                    </cite>
                    
                    <div className="flex flex-wrap gap-2">
                      {quote.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`
                            px-2 py-1 text-xs rounded-full cursor-pointer transition-colors
                            ${tag === selectedCategory
                              ? 'bg-blue-500 text-white'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                            }
                          `}
                          onClick={() => tag !== selectedCategory && handleCategorySelect(tag)}
                          title={tag === selectedCategory ? 'Kategori aktif' : `Filter berdasarkan ${tag}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {quotes.length >= 10 && (
                <div className="text-center pt-6">
                  <button
                    onClick={() => handleCategorySelect(selectedCategory)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Muat Lebih Banyak
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty State for Category */}
          {!loading && !error && quotes.length === 0 && selectedCategory && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Tidak Ada Quote Ditemukan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Belum ada quote untuk kategori "{selectedCategory}".
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Pilih Kategori Lain
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
