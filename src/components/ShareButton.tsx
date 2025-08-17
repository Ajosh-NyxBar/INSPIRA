/**
 * ShareButton Component
 * Tombol untuk berbagi quote ke berbagai platform
 */

'use client';

import { useState } from 'react';
import { Quote } from '@/types';

interface ShareButtonProps {
  quote: Quote;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function ShareButton({ 
  quote, 
  size = 'md', 
  showText = false,
  className = ''
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Format quote untuk sharing
  const formatQuote = () => {
    return `"${quote.content}"\n\n— ${quote.author}\n\n#InspirasiHub #QuoteIndonesia`;
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Share options
  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '📱',
      url: `https://wa.me/?text=${encodeURIComponent(formatQuote())}`,
      color: 'hover:bg-green-50 hover:text-green-600'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(formatQuote())}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-50 hover:text-blue-600'
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(formatQuote())}`,
      color: 'hover:bg-blue-50 hover:text-blue-700'
    },
    {
      name: 'Telegram',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(formatQuote())}`,
      color: 'hover:bg-blue-50 hover:text-blue-500'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`Quote dari ${quote.author}`)}&summary=${encodeURIComponent(quote.content)}`,
      color: 'hover:bg-blue-50 hover:text-blue-800'
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(formatQuote());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
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
    <div className="relative">
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 
          transition-all duration-200 
          hover:scale-110 active:scale-95
          text-gray-600 hover:text-blue-600
          ${className}
        `}
        title="Bagikan Quote"
      >
        {/* Share Icon */}
        <div className={`${sizeClasses[size]} flex items-center justify-center`}>
          <svg 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </div>

        {/* Optional text */}
        {showText && (
          <span className={`font-medium ${textSizeClasses[size]}`}>
            Bagikan
          </span>
        )}
      </button>

      {/* Share Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute bottom-full right-0 mb-2 z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">Bagikan Quote</h3>
              <p className="text-xs text-gray-500 mt-1">Pilih platform untuk berbagi</p>
            </div>

            {/* Share Options */}
            <div className="py-2">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => handleShare(option.url)}
                  className={`
                    w-full px-4 py-3 text-left flex items-center gap-3
                    transition-colors duration-200
                    ${option.color}
                  `}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium text-sm">{option.name}</span>
                </button>
              ))}

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
              >
                <span className="text-lg">📋</span>
                <span className="font-medium text-sm">
                  {copied ? 'Tersalin!' : 'Salin Teks'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
