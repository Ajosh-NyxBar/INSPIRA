# 🔥 Cara Mendapatkan Firebase Web App ID

## Langkah-langkah Detail

### 1. Buka Firebase Console
- Pergi ke: https://console.firebase.google.com/
- Login dengan akun Google yang sama dengan project `inspira-f55e4`

### 2. Pilih Project
- Klik project `inspira-f55e4`

### 3. Masuk ke Project Settings
- Klik ikon **gear/roda gigi ⚙️** di sidebar kiri
- Pilih **"Project settings"**

### 4. Scroll ke Bagian "Your apps"
- Di halaman Project Settings, scroll ke bawah
- Cari section **"Your apps"** atau **"SDK setup and configuration"**

### 5. Cek Web App yang Ada
**Jika sudah ada Web App:**
- Akan ada app dengan icon `</>` (web)
- Klik pada app tersebut
- Akan muncul config seperti ini:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC2v6tIowAQLJV9PVC8gVOE0bFiTJ45Tko",
  authDomain: "inspira-f55e4.firebaseapp.com",
  projectId: "inspira-f55e4",
  storageBucket: "inspira-f55e4.appspot.com",
  messagingSenderId: "104540757625472776872",
  appId: "1:104540757625472776872:web:REAL_APP_ID_HERE"
  //      ↑ INI yang kamu butuhkan!
};
```

**Jika belum ada Web App:**
- Klik **"Add app"**
- Pilih icon **`</>`** (Web)
- Masukkan nickname: **"InspiraHub Web"**
- Centang **"Also set up Firebase Hosting"** (optional)
- Klik **"Register app"**
- Copy config yang muncul

### 6. Copy App ID
- Dari config di atas, copy nilai `appId`
- Contoh: `"1:104540757625472776872:web:abc123def456ghi789"`

### 7. Update .env.local
- Ganti di file `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_APP_ID=1:104540757625472776872:web:REAL_APP_ID_DARI_FIREBASE
```

## Screenshot Bantuan
Jika kesulitan, cari bagian yang terlihat seperti ini di Firebase Console:

```
Your apps
├── Android apps (0)
├── iOS apps (0)
└── Web apps (1)  ← Klik ini
    └── InspiraHub Web
        └── App ID: 1:104540757625472776872:web:abc123...
```

## Kenapa Penting?
App ID yang benar diperlukan untuk:
- ✅ Koneksi Firebase yang stabil
- ✅ Analytics tracking
- ✅ Proper authentication
- ✅ Tidak ada error 400 Bad Request

## Alternatif Cepat
Jika belum bisa akses Firebase Console sekarang, App ID sementara yang saya berikan sudah cukup untuk testing. Tapi untuk production, harus pakai yang asli dari Firebase Console.
