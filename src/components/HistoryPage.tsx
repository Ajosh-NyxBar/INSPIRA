/**
 * History Page Component
 * Menampilkan riwayat quotes yang pernah dibaca user
 */

'use client';

import { useState, useEffect } from 'react';
import { Quote } from '@/types';
import { getHistory, clearHistory, addToFavorites } from '@/lib/localStorage';
import FavoriteButton from './FavoriteButton';
import ShareButton from './ShareButton';

export default function HistoryPage() {
  const [history, setHistory] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<Quote[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    // Filter history berdasarkan search term
    if (searchTerm.trim() === '') {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter(quote =>
        quote.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredHistory(filtered);
    }
  }, [searchTerm, history]);

  const loadHistory = () => {
    setLoading(true);
    const hist = getHistory();
    setHistory(hist);
    setLoading(false);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setFilteredHistory([]);
    setShowConfirmClear(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Riwayat Bacaan 📚
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {history.length} quote pernah Anda baca
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Hapus Riwayat
          </button>
        )}
      </div>

      {/* Search Bar */}
      {history.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari berdasarkan konten, author, atau tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Ditemukan {filteredHistory.length} dari {history.length} quote
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Belum Ada Riwayat
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Mulai jelajahi quotes inspiratif untuk melihat riwayat bacaan Anda di sini.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Mulai Membaca
          </a>
        </div>
      ) : filteredHistory.length === 0 ? (
        /* No Search Results */
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Tidak Ditemukan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Tidak ada quote yang cocok dengan pencarian "{searchTerm}".
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Lihat Semua Riwayat
          </button>
        </div>
      ) : (
        /* History List */
        <div className="space-y-4">
          {filteredHistory.map((quote, index) => (
            <div
              key={`${quote.id}-${index}`}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              {/* Quote Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <FavoriteButton quote={quote} size="sm" />
                  <ShareButton quote={quote} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>#{index + 1}</span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              {/* Quote Content */}
              <blockquote className="text-gray-800 dark:text-gray-200 leading-relaxed mb-3 italic">
                "{quote.content}"
              </blockquote>

              {/* Author and Tags */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <cite className="text-gray-600 dark:text-gray-400 font-medium">
                  — {quote.author}
                </cite>
                
                {quote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {quote.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        onClick={() => setSearchTerm(tag)}
                        title={`Filter berdasarkan ${tag}`}
                      >
                        {tag}
                      </span>
                    ))}
                    {quote.tags.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{quote.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Hapus Semua Riwayat?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Semua {history.length} riwayat bacaan akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleClearHistory}
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
