// App Configuration
export const APP_CONFIG = {
  name: 'InspirasiHub',
  description: 'Temukan inspirasi dan motivasi dalam bahasa Indonesia untuk hari-harimu',
  version: '1.0.0',
  author: 'InspirasiHub Team',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// API Configuration
export const API_CONFIG = {
  quotesIndonesia: {
    baseUrl: 'https://raw.githubusercontent.com/lakuapik/quotes-indonesia/master/raw',
    sourceRepo: 'https://github.com/lakuapik/quotes-indonesia',
    defaultLimit: 10,
    maxLimit: 150,
  }
} as const;

// Phase 1 - Categories yang akan digunakan untuk filtering (dalam Bahasa Indonesia)
export const QUOTE_CATEGORIES = [
  { id: 'motivasi', name: 'Motivasi', slug: 'motivasi', color: 'blue' },
  { id: 'inspirasi', name: 'Inspirasi', slug: 'inspirasi', color: 'purple' },
  { id: 'kebijaksanaan', name: 'Kebijaksanaan', slug: 'kebijaksanaan', color: 'green' },
  { id: 'sukses', name: 'Sukses', slug: 'sukses', color: 'yellow' },
  { id: 'kebahagiaan', name: 'Kebahagiaan', slug: 'kebahagiaan', color: 'pink' },
  { id: 'kehidupan', name: 'Kehidupan', slug: 'kehidupan', color: 'indigo' },
  { id: 'cinta', name: 'Cinta', slug: 'cinta', color: 'red' },
  { id: 'kerja-keras', name: 'Kerja Keras', slug: 'kerja-keras', color: 'teal' },
  { id: 'kesabaran', name: 'Kesabaran', slug: 'kesabaran', color: 'gray' },
] as const;

// UI Constants
export const UI_CONFIG = {
  animation: {
    duration: 200,
    easing: 'ease-in-out',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    secondary: {
      50: '#f8fafc',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
    }
  }
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  favorites: 'inspira-favorites',
  preferences: 'inspira-preferences',
  userSettings: 'inspira-user-settings',
  recentQuotes: 'inspira-recent-quotes',
} as const;

// Error Messages (dalam Bahasa Indonesia)
export const ERROR_MESSAGES = {
  network: 'Koneksi internet bermasalah. Silakan coba lagi.',
  api: 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.',
  notFound: 'Kutipan tidak ditemukan.',
  generic: 'Terjadi kesalahan yang tidak terduga.',
} as const;

// Success Messages (dalam Bahasa Indonesia)
export const SUCCESS_MESSAGES = {
  saved: 'Kutipan berhasil disimpan!',
  shared: 'Kutipan berhasil dibagikan!',
  copied: 'Kutipan berhasil disalin ke clipboard!',
} as const;

// Informasi tentang sumber data
export const DATA_SOURCE = {
  name: 'Quotes Indonesia',
  description: 'Kumpulan kutipan inspiratif dari tokoh-tokoh dunia dalam bahasa Indonesia',
  author: 'David Adi Nugroho (lakuapik)',
  repository: 'https://github.com/lakuapik/quotes-indonesia',
  license: 'MIT License',
  totalQuotes: '500+',
  language: 'Bahasa Indonesia',
} as const;
