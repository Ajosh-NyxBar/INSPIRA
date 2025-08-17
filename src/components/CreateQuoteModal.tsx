/**
 * Create Quote Modal Component
 * Modal for users to create custom quotes
 */

'use client';

import { useState } from 'react';
import { UserQuoteSystem } from '@/lib/userQuoteSystem';
import { UserQuote } from '@/types/phase3';
import { QUOTE_CATEGORIES } from '@/lib/constants';

interface CreateQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (quote: UserQuote) => void;
}

export default function CreateQuoteModal({ isOpen, onClose, onSuccess }: CreateQuoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    content: '',
    author: '',
    tags: [] as string[],
    isPublic: true,
    customTag: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (error) setError(null); // Clear error when user types
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleCustomTagAdd = () => {
    const customTag = formData.customTag.trim();
    if (customTag && !formData.tags.includes(customTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag],
        customTag: ''
      }));
    }
  };

  const handleCustomTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomTagAdd();
    }
  };

  const validateForm = (): boolean => {
    if (!formData.content.trim()) {
      setError('Konten quote harus diisi');
      return false;
    }
    
    if (formData.content.length < 10) {
      setError('Konten quote minimal 10 karakter');
      return false;
    }
    
    if (formData.content.length > 500) {
      setError('Konten quote maksimal 500 karakter');
      return false;
    }
    
    if (formData.author.trim() && formData.author.length > 100) {
      setError('Nama penulis maksimal 100 karakter');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await UserQuoteSystem.createQuote({
        content: formData.content.trim(),
        author: formData.author.trim(),
        tags: formData.tags,
        isPublic: formData.isPublic
      });
      
      if (result.success && result.quote) {
        onSuccess(result.quote);
        onClose();
        resetForm();
      } else {
        setError(result.error || 'Gagal membuat quote');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      content: '',
      author: '',
      tags: [],
      isPublic: true,
      customTag: ''
    });
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  const remainingChars = 500 - formData.content.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Buat Quote Inspiratif ✨
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Bagikan inspirasi Anda dengan komunitas InspirasiHub
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quote Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Konten Quote *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Tulis quote inspiratif Anda di sini..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Minimal 10 karakter
              </span>
              <span className={`${remainingChars < 50 ? 'text-orange-500' : remainingChars < 0 ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400`}>
                {remainingChars} karakter tersisa
              </span>
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Penulis (opsional)
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Kosongkan untuk menggunakan nama Anda"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={loading}
            />
          </div>

          {/* Tags Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori Tags
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {QUOTE_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleTagToggle(category.name)}
                  disabled={loading}
                  className={`
                    p-2 text-sm rounded-lg border transition-colors disabled:opacity-50
                    ${formData.tags.includes(category.name)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-300'
                    }
                  `}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                name="customTag"
                value={formData.customTag}
                onChange={handleInputChange}
                onKeyPress={handleCustomTagKeyPress}
                placeholder="Tambah tag custom..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleCustomTagAdd}
                disabled={loading || !formData.customTag.trim()}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                Tambah
              </button>
            </div>

            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      disabled={loading}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              disabled={loading}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
              Publikasikan untuk semua orang
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3 ml-7">
            Quote publik dapat dilihat dan disukai oleh semua pengguna
          </p>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !formData.content.trim() || remainingChars < 0}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Membuat...
                </>
              ) : (
                'Buat Quote ✨'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
