'use client';

import { useState, useEffect } from 'react';
import { Quote } from '@/types';
import { QuotableAPI } from '@/lib/quotable';
import { addToHistory, recordVisit } from '@/lib/localStorage';
import FavoriteButton from './FavoriteButton';
import ShareButton from './ShareButton';

export default function QuoteCard() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await QuotableAPI.getRandomQuote();
      setQuote(data);
      
      // Add to history and record visit
      if (data) {
        addToHistory(data);
        recordVisit();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="text-red-600 dark:text-red-400 text-center">
          <p className="font-semibold mb-2">Oops! Something went wrong</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchQuote}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {quote && (
        <>
          {/* Quote Actions Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FavoriteButton quote={quote} size="md" />
              <ShareButton quote={quote} size="md" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>#{quote.id.split('-')[1]}</span>
              {quote.tags.length > 0 && (
                <span>• {quote.tags.length} tags</span>
              )}
            </div>
          </div>

          <blockquote className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-6 italic">
            "{quote.content}"
          </blockquote>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <cite className="text-gray-600 dark:text-gray-400 font-medium">
              — {quote.author}
            </cite>
            
            <div className="flex flex-wrap gap-2">
              {quote.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  title={`Filter berdasarkan ${tag}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={fetchQuote}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? 'Memuat...' : 'Inspirasi Baru ✨'}
            </button>
          </div>
          
          {/* Data source attribution */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sumber: {' '}
              <a 
                href="https://github.com/lakuapik/quotes-indonesia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Quotes Indonesia
              </a>
              {' '} oleh David Adi Nugroho
            </p>
          </div>
        </>
      )}
    </div>
  );
}
