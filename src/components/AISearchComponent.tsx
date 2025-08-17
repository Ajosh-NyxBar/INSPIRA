/**
 * AI Search Component - Phase 5
 * Advanced AI-powered search with semantic understanding
 * Date: August 17, 2025
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AISearchQuery, AISearchResult, AISearchComponentProps } from '../types/phase5';
import AIService from '../lib/aiService';

const AISearchComponent: React.FC<AISearchComponentProps> = ({
  isVisible,
  onClose,
  onSearch,
  searchHistory,
  isPremium
}) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<AISearchQuery['type']>('semantic');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<AISearchResult[]>([]);
  const [filters, setFilters] = useState<AISearchQuery['filters']>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [nlpSuggestions, setNlpSuggestions] = useState<string[]>([]);

  const aiService = AIService.getInstance();

  useEffect(() => {
    if (query.length > 3) {
      generateNLPSuggestions(query);
    } else {
      setNlpSuggestions([]);
    }
  }, [query]);

  const generateNLPSuggestions = async (searchQuery: string) => {
    try {
      const nlpResult = await aiService.processNaturalLanguage(searchQuery);
      const suggestions = [];
      
      if (nlpResult.intent === 'search' && nlpResult.entities.category) {
        suggestions.push(`Cari quote kategori "${nlpResult.entities.category}"`);
      }
      
      if (nlpResult.entities.sentiment) {
        suggestions.push(`Quote dengan sentiment ${nlpResult.entities.sentiment}`);
      }
      
      if (nlpResult.entities.author) {
        suggestions.push(`Quote dari ${nlpResult.entities.author}`);
      }
      
      setNlpSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating NLP suggestions:', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (!isPremium) {
      alert('Fitur AI Search membutuhkan upgrade premium!');
      return;
    }

    setIsSearching(true);
    try {
      const searchQuery: AISearchQuery = {
        id: Date.now().toString(),
        query: query.trim(),
        type: searchType,
        filters,
        results: [],
        timestamp: new Date().toISOString(),
        userId: 'current_user' // Should come from auth context
      };

      const searchResults = await aiService.searchQuotes(searchQuery);
      setResults(searchResults);
      onSearch({ ...searchQuery, results: searchResults });
    } catch (error) {
      console.error('Search failed:', error);
      alert('Pencarian gagal. Silakan coba lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickSearch = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch();
  };

  const SearchTypeSelector = () => (
    <div className="flex gap-2 mb-4">
      {[
        { type: 'semantic', label: '🧠 Semantic', desc: 'Pencarian berdasarkan makna' },
        { type: 'sentiment', label: '😊 Sentiment', desc: 'Pencarian berdasarkan emosi' },
        { type: 'category', label: '📂 Category', desc: 'Pencarian berdasarkan kategori' },
        { type: 'author', label: '👤 Author', desc: 'Pencarian berdasarkan penulis' }
      ].map(({ type, label, desc }) => (
        <button
          key={type}
          onClick={() => setSearchType(type as AISearchQuery['type'])}
          className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all ${
            searchType === type
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title={desc}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const AdvancedFilters = () => (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white">🔧 Filter Lanjutan</h4>
      
      {/* Sentiment Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sentiment
        </label>
        <select
          value={filters.sentiment || ''}
          onChange={(e) => setFilters({ ...filters, sentiment: e.target.value as any })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Semua Sentiment</option>
          <option value="positive">😊 Positif</option>
          <option value="neutral">😐 Netral</option>
          <option value="negative">😔 Negatif</option>
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Kategori
        </label>
        <div className="flex flex-wrap gap-2">
          {['motivasi', 'cinta', 'hidup', 'sukses', 'kebahagiaan', 'wisdom'].map(category => (
            <button
              key={category}
              onClick={() => {
                const currentCategories = filters.category || [];
                const newCategories = currentCategories.includes(category)
                  ? currentCategories.filter(c => c !== category)
                  : [...currentCategories, category];
                setFilters({ ...filters, category: newCategories });
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filters.category?.includes(category)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Quote Length Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Panjang Quote
        </label>
        <select
          value={filters.length || ''}
          onChange={(e) => setFilters({ ...filters, length: e.target.value as any })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Semua Panjang</option>
          <option value="short">📝 Pendek (&lt; 50 kata)</option>
          <option value="medium">📄 Sedang (50-100 kata)</option>
          <option value="long">📋 Panjang (&gt; 100 kata)</option>
        </select>
      </div>
    </div>
  );

  const SearchResult = ({ result }: { result: AISearchResult }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <blockquote className="text-gray-900 dark:text-white text-lg font-medium mb-2">
            "{result.quote.text}"
          </blockquote>
          <cite className="text-gray-600 dark:text-gray-400">
            — {result.quote.author}
          </cite>
        </div>
        <div className="ml-4 text-right">
          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {Math.round(result.relevanceScore * 100)}% relevan
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            result.sentiment.label === 'positive' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : result.sentiment.label === 'negative'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {result.sentiment.label === 'positive' ? '😊 Positif' : 
             result.sentiment.label === 'negative' ? '😔 Negatif' : '😐 Netral'}
          </span>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
            {result.quote.category}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            ❤️
          </button>
          <button className="text-gray-400 hover:text-blue-500 transition-colors">
            📤
          </button>
        </div>
      </div>

      {result.keywords.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Keywords: </span>
            {result.keywords.join(', ')}
          </div>
        </div>
      )}

      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
        {result.explanation}
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🤖 AI Search
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Cari quote dengan kecerdasan buatan yang memahami makna
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search Interface */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <SearchTypeSelector />
          
          <div className="relative mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Contoh: quote tentang motivasi untuk sukses..."
              className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                '🔍'
              )}
            </button>
          </div>

          {/* NLP Suggestions */}
          {nlpSuggestions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">💡 Saran pencarian:</p>
              <div className="flex flex-wrap gap-2">
                {nlpSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(suggestion)}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Filters Toggle */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
            >
              {showAdvancedFilters ? '🔼 Sembunyikan Filter' : '🔽 Filter Lanjutan'}
            </button>
            
            {!isPremium && (
              <div className="text-sm text-amber-600 dark:text-amber-400">
                🔒 Upgrade premium untuk akses penuh
              </div>
            )}
          </div>

          {showAdvancedFilters && <div className="mt-4"><AdvancedFilters /></div>}
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">AI sedang mencari quote terbaik untuk Anda...</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🎯 Ditemukan {results.length} hasil
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Diurutkan berdasarkan relevansi
                </div>
              </div>
              {results.map((result, index) => (
                <SearchResult key={index} result={result} />
              ))}
            </div>
          ) : query && !isSearching ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-600 dark:text-gray-400">
                Tidak ada hasil yang ditemukan untuk "{query}"
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Coba gunakan kata kunci yang berbeda atau filter yang lebih luas
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Selamat datang di AI Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Cari quote dengan kecerdasan buatan yang memahami makna dan konteks
              </p>
              
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    📚 Pencarian Terakhir
                  </h4>
                  <div className="space-y-2">
                    {searchHistory.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search.query)}
                        className="block w-full p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="text-gray-900 dark:text-white font-medium">
                          {search.query}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {search.results.length} hasil • {new Date(search.timestamp).toLocaleDateString('id-ID')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISearchComponent;
