'use client';

import { useState } from 'react';
import QuoteCard from '@/components/QuoteCard';
import FavoritesPage from '@/components/FavoritesPage';
import HistoryPage from '@/components/HistoryPage';
import CategoriesPage from '@/components/CategoriesPage';
import Navigation from '@/components/Navigation';

type PageType = 'home' | 'favorites' | 'history' | 'categories';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'favorites':
        return <FavoritesPage />;
      case 'history':
        return <HistoryPage />;
      case 'categories':
        return <CategoriesPage />;
      default:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                InspirasiHub ✨
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                Kumpulan quotes inspiratif dalam bahasa Indonesia
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Temukan inspirasi baru setiap hari dengan koleksi quotes pilihan
              </p>
            </div>
            
            <QuoteCard />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="pb-8">
        {renderCurrentPage()}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>InspirasiHub</strong> - Platform inspirasi dalam bahasa Indonesia
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Data quotes dari{' '}
              <a 
                href="https://github.com/lakuapik/quotes-indonesia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Quotes Indonesia
              </a>
              {' '}oleh David Adi Nugroho • Built with ❤️ using Next.js 14
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
