/**
 * FavoriteButton Component
 * Toggle button untuk menambah/hapus quote dari favorites
 */

'use client';

import { useState, useEffect } from 'react';
import { Quote } from '@/types';
import { addToFavorites, removeFromFavorites, isFavorite } from '@/lib/localStorage';

interface FavoriteButtonProps {
  quote: Quote;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
}

export default function FavoriteButton({ 
  quote, 
  size = 'md', 
  showText = false,
  className = '',
  onToggle
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check favorite status on mount
  useEffect(() => {
    setIsFavorited(isFavorite(quote.id));
  }, [quote.id]);

  const handleToggle = async () => {
    setIsLoading(true);
    
    try {
      let success = false;
      
      if (isFavorited) {
        success = removeFromFavorites(quote.id);
      } else {
        success = addToFavorites(quote);
      }
      
      if (success) {
        const newState = !isFavorited;
        setIsFavorited(newState);
        onToggle?.(newState);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Size variants
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        flex items-center gap-2 
        transition-all duration-200 
        hover:scale-110 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isFavorited ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
    >
      {/* Heart Icon */}
      <div className={`
        ${sizeClasses[size]} 
        flex items-center justify-center
        transition-colors duration-200
        ${isFavorited 
          ? 'text-red-500' 
          : 'text-gray-400 hover:text-red-400'
        }
      `}>
        {isLoading ? (
          // Loading spinner
          <svg 
            className="animate-spin" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          // Heart icon
          <svg 
            fill={isFavorited ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        )}
      </div>

      {/* Optional text */}
      {showText && (
        <span className={`
          font-medium transition-colors duration-200
          ${textSizeClasses[size]}
          ${isFavorited 
            ? 'text-red-600' 
            : 'text-gray-600 hover:text-red-500'
          }
        `}>
          {isFavorited ? 'Favorit' : 'Favoritkan'}
        </span>
      )}
    </button>
  );
}
