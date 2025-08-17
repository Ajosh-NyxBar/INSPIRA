# InspirasiHub 🌟

**Sebuah platform web inspirasi berbasis Next.js untuk mendapatkan motivasi, inspirasi, dan berbagi kutipan.**

## 🎯 Visi
Menjadi wadah bagi orang-orang untuk mendapatkan motivasi, inspirasi, dan berbagi kutipan. Tidak hanya random, tapi personalisasi sesuai mood dan bisa dibagikan ke orang lain.

## 🚀 Phase 1 - MVP (COMPLETED) ✅

### Features Implemented:
- [x] **Random Quote Generator**: Fetch kutipan random dari Quotes Indonesia API
- [x] **Responsive Design**: UI modern dengan Tailwind CSS yang responsif
- [x] **Loading States**: Skeleton loading dan error handling
- [x] **Dark Mode Support**: Otomatis mengikuti sistem preferences
- [x] **Modern Architecture**: Component-based dengan TypeScript
- [x] **Clean API Layer**: Utility functions untuk API calls
- [x] **Indonesian Content**: Kutipan inspiratif dalam bahasa Indonesia
- [x] **Smart Tagging**: Auto-categorization berdasarkan konten kutipan

### Tech Stack:
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **API**: Quotes Indonesia (https://github.com/lakuapik/quotes-indonesia)
- **Data Source**: 500+ kutipan berbahasa Indonesia
- **Deployment**: Ready untuk Vercel/Netlify

### File Structure:
```
src/
├── app/
│   ├── page.tsx              # Halaman utama
│   └── layout.tsx            # Root layout
├── components/
│   └── QuoteCard.tsx         # Komponen utama quote
├── lib/
│   ├── quotable.ts           # API utilities
│   └── constants.ts          # Konfigurasi app
└── types/
    └── index.ts              # TypeScript definitions
```

## 🛠️ Roadmap Phase Selanjutnya

### Phase 2 - Personalisasi & Favorit (NEXT)
- [ ] Simpan quote favorit ke localStorage
- [ ] Filter quote berdasarkan kategori (motivasi, cinta, sukses, dll)
- [ ] Riwayat quote yang pernah dilihat
- [ ] Pencarian quote berdasar keyword/author
- [ ] Share quote ke social media

### Phase 3 - User Account & Database
- [ ] Authentication (NextAuth.js)
- [ ] User profiles & settings
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User-generated quotes
- [ ] Cloud storage untuk favorites

### Phase 4 - Fitur Sosial
- [ ] Follow system
- [ ] Like, comment, share quotes
- [ ] Personal feed/timeline
- [ ] Quote collections
- [ ] User leaderboards

### Phase 5 - AI Recommendation
- [ ] AI-powered mood detection
- [ ] Personalized quote recommendations
- [ ] Chatbot untuk motivational quotes
- [ ] Smart categorization

### Phase 6 - Multi-Platform
- [ ] Progressive Web App (PWA)
- [ ] Mobile app (React Native/Expo)
- [ ] Browser extensions
- [ ] API integrations (Twitter, Instagram)

### Phase 7 - Monetisasi
- [ ] Premium subscriptions
- [ ] Quote merchandise
- [ ] Ads integration
- [ ] Creator monetization

### Phase 8 - Scaling & Advanced Features
- [ ] CDN optimization
- [ ] Advanced analytics
- [ ] Internationalization (i18n)
- [ ] Advanced performance optimization

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📱 Current Features Demo

1. **Homepage**: Clean, modern design dengan gradient background
2. **Quote Card**: Menampilkan kutipan random Indonesia dengan author dan tags
3. **New Quote Button**: Generate kutipan baru dengan animasi loading
4. **Responsive**: Optimal di desktop dan mobile
5. **Error Handling**: Graceful error states dengan retry functionality
6. **Indonesian Content**: Semua kutipan dalam bahasa Indonesia
7. **Smart Tags**: Auto-kategorisasi berdasarkan konten kutipan
8. **Source Attribution**: Credit ke sumber data Quotes Indonesia

## 🎨 Design Principles

- **Minimalist**: Focus pada konten utama (quote)
- **Accessible**: Color contrast yang baik, readable fonts
- **Responsive**: Mobile-first approach
- **Fast**: Optimized loading dan performance
- **Intuitive**: Simple navigation dan interactions

## 🔮 Future Vision

InspirasiHub akan menjadi ecosystem lengkap untuk inspirasi dan motivasi, dengan:
- **Personal AI Coach**: AI yang memahami mood dan memberikan quote tepat
- **Community Platform**: Tempat berbagi dan diskusi inspirasi
- **Content Creation Tools**: Tools untuk membuat visual quotes
- **Wellness Integration**: Integrasi dengan mindfulness dan wellness apps

---

**Made with ❤️ for spreading inspiration**
