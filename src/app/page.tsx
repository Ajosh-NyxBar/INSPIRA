import QuoteCard from '@/components/QuoteCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="text-center pt-12 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          InspirasiHub
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
          Temukan inspirasi dan motivasi dalam bahasa Indonesia untuk hari-harimu. 
          <br />
          <span className="text-blue-600 dark:text-blue-400 font-medium">Setiap kutipan adalah permulaan baru.</span>
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <QuoteCard />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">
            Dibuat dengan ❤️ untuk menyebarkan inspirasi
          </p>
          <p>
            Powered by{' '}
            <a 
              href="https://github.com/lakuapik/quotes-indonesia" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Quotes Indonesia
            </a>
            {' '} by David Adi Nugroho
          </p>
        </div>
      </footer>
    </div>
  );
}
