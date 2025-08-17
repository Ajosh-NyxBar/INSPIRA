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
- **Database**: Firebase Firestore (Phase 3)
- **Authentication**: Firebase Auth (Phase 3)
- **Storage**: Firebase Storage (Phase 3)
- **API**: Quotes Indonesia (https://github.com/lakuapik/quotes-indonesia)
- **Data Source**: 500+ kutipan berbahasa Indonesia + User-generated content
- **Deployment**: Ready untuk Vercel/Netlify

### File Structure:
```
src/
├── app/
│   ├── page.tsx              # Halaman utama dengan social feed
│   └── layout.tsx            # Root layout
├── components/
│   ├── QuoteCard.tsx         # Komponen quote card
│   ├── Navigation.tsx        # Navigation dengan auth (Phase 3)
│   ├── CommunityFeed.tsx     # Social feed (Phase 3)
│   ├── AuthModal.tsx         # Authentication modal (Phase 3)
│   ├── CreateQuoteModal.tsx  # Quote creation (Phase 3)
│   ├── UserProfile.tsx       # User profiles (Phase 3)
│   └── NotificationSystem.tsx # Notifications (Phase 3)
├── lib/
│   ├── quotable.ts           # API utilities
│   ├── firebase.ts           # Firebase config (Phase 3)
│   ├── firebaseUserService.ts # User management (Phase 3)
│   ├── firebaseQuoteService.ts # Quote management (Phase 3)
│   ├── userSystem.ts         # User system wrapper (Phase 3)
│   ├── userQuoteSystem.ts    # Quote system wrapper (Phase 3)
│   └── constants.ts          # Konfigurasi app
└── types/
    ├── index.ts              # Basic TypeScript definitions
    └── phase3.ts             # Social features types (Phase 3)
```

## 🛠️ Roadmap Phase Selanjutnya

### Phase 2 - Personalisasi & Favorit (COMPLETED) ✅
- [x] Simpan quote favorit ke localStorage
- [x] Filter quote berdasarkan kategori (motivasi, cinta, sukses, dll)
- [x] Riwayat quote yang pernah dilihat
- [x] Pencarian quote berdasar keyword/author
- [x] Share quote ke social media
- [x] Custom tags dan kategorisasi
- [x] Settings panel untuk kustomisasi

### Phase 3 - Social Features & Database (COMPLETED) ✅
- [x] Firebase Authentication (Google, Email/Password)
- [x] User profiles & social relationships
- [x] Firestore database integration
- [x] User-generated quotes with social interactions
- [x] Real-time community feed
- [x] Like, comment, share system
- [x] Follow/unfollow functionality
- [x] Notification system
- [x] Firebase Storage for user content
- [x] Demo mode for development

### Phase 4 - Advanced Social Features (NEXT)
- [ ] Quote collections and playlists
- [ ] Advanced user discovery
- [ ] Trending hashtags and topics
- [ ] User reputation system
- [ ] Content moderation tools
- [ ] Advanced analytics dashboard

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

## 🔥 Firebase Setup (Phase 3)

InspirasiHub uses Firebase for authentication, database, and storage. To set up Firebase:

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication, Firestore, and Storage

2. **Environment Variables**:
   Create `.env.local` file with your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Optional: Set to true for demo mode (works without Firebase)
   NEXT_PUBLIC_DEMO_MODE=false
   ```

3. **Demo Mode**:
   If you don't have Firebase setup, set `NEXT_PUBLIC_DEMO_MODE=true` to use local storage fallback.

4. **Firebase Services Used**:
   - **Authentication**: Google Sign-in, Email/Password
   - **Firestore**: User profiles, quotes, comments, social relationships
   - **Storage**: User avatars and quote images

## 📱 Current Features Demo

### Phase 1 & 2 Features:
1. **Homepage**: Clean, modern design dengan gradient background
2. **Quote Card**: Menampilkan kutipan random Indonesia dengan author dan tags
3. **New Quote Button**: Generate kutipan baru dengan animasi loading
4. **Responsive**: Optimal di desktop dan mobile
5. **Error Handling**: Graceful error states dengan retry functionality
6. **Indonesian Content**: Semua kutipan dalam bahasa Indonesia
7. **Smart Tags**: Auto-kategorisasi berdasarkan konten kutipan
8. **Favorites**: Save dan manage quote favorit
9. **Search & Filter**: Pencarian berdasarkan keyword dan kategori

### Phase 3 Social Features:
10. **User Authentication**: Login dengan Google atau Email/Password
11. **Community Feed**: Timeline sosial dengan quotes dari user lain
12. **Create Quotes**: Buat dan bagikan quote original
13. **Social Interactions**: Like, comment, dan share quotes
14. **User Profiles**: Profile lengkap dengan follower/following
15. **Real-time Notifications**: Notifikasi untuk interaksi sosial
16. **Follow System**: Follow user lain dan lihat quotes mereka
17. **Search Users**: Temukan dan connect dengan user lain
18. **Quote Management**: Edit dan delete quote sendiri
19. **Privacy Controls**: Atur visibility quote (public/private)
20. **Demo Mode**: Bisa dijalankan tanpa Firebase setup

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
