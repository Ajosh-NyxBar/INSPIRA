# 📱 Phone Authentication Setup Guide

## ❌ Current Issue

Phone authentication is failing with reCAPTCHA errors:
```
GET https://identitytoolkit.googleapis.com/v2/recaptchaConfig?key=... 400 (Bad Request)
Failed to initialize reCAPTCHA Enterprise config
```

## 🔧 Solution: Firebase Phone Auth Configuration

### 1. Enable Phone Authentication in Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select Project**: `inspira-f55e4`
3. **Navigate to Authentication** → **Sign-in method**
4. **Enable Phone Provider**:
   - Click on "Phone" 
   - Toggle "Enable"
   - Click "Save"

### 2. Configure reCAPTCHA for Phone Auth

#### Option A: reCAPTCHA v3 (Recommended)
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select Project**: `inspira-f55e4`
3. **Enable reCAPTCHA Enterprise API**:
   ```
   APIs & Services → Library → Search "reCAPTCHA" → Enable
   ```
4. **Create reCAPTCHA Key**:
   - Go to Security → reCAPTCHA Enterprise
   - Create Key → Website
   - Domain: `localhost` (for development)
   - Domain: `your-domain.com` (for production)

#### Option B: reCAPTCHA v2 (Fallback)
1. **Go to reCAPTCHA Admin**: https://www.google.com/recaptcha/admin/
2. **Create New Site**:
   - Label: "InspiraHub Phone Auth"
   - Type: reCAPTCHA v2 "I'm not a robot"
   - Domains: `localhost`, `127.0.0.1`
3. **Copy Site Key and Secret Key**

### 3. Update Firebase Project Settings

1. **Firebase Console** → **Project Settings** → **General**
2. **Your apps** → **Web app** → **Config**
3. **Copy the real configuration**:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-real-api-key",
     authDomain: "inspira-f55e4.firebaseapp.com", 
     projectId: "inspira-f55e4",
     storageBucket: "inspira-f55e4.appspot.com",
     messagingSenderId: "104540757625472776872",
     appId: "your-real-app-id"
   };
   ```

### 4. Configure Authentication Domain

1. **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
2. **Add domains**:
   - `localhost` (for development)
   - `your-domain.com` (for production)

### 5. Test Phone Numbers (Development)

For testing without SMS costs:
1. **Firebase Console** → **Authentication** → **Settings** → **Phone numbers for testing**
2. **Add test numbers**:
   ```
   +1 650-555-3434 → 123456
   +62 812-3456-7890 → 123456
   ```

## 🔄 Current Workaround

**Phone authentication is temporarily disabled** until proper configuration:

```typescript
// AuthModal.tsx - Line 410
{false && (
  <button onClick={() => setMode('phone')}>
    Masuk dengan Nomor HP
  </button>
)}
```

## ✅ Available Authentication Methods

While phone auth is being configured:

### 1. **Email/Password** ✅
```
- Registration with email
- Login with email/password
- Profile creation in Firestore
```

### 2. **Google OAuth** ✅ 
```
- One-click Google login
- Auto profile creation
- Real Google authentication
```

### 3. **GitHub OAuth** ✅
```
- One-click GitHub login  
- Auto profile creation
- Real GitHub authentication
```

## 🎯 Re-enable Phone Auth

After Firebase configuration:

1. **Update .env.local** with real API keys
2. **Enable phone auth button** in AuthModal:
   ```typescript
   {true && ( // Change false to true
     <button onClick={() => setMode('phone')}>
       Masuk dengan Nomor HP
     </button>
   )}
   ```
3. **Test with real phone numbers**

## 🚀 Current Status

- ✅ **Firebase**: Active and working
- ✅ **Email Auth**: Fully functional  
- ✅ **Google OAuth**: Fully functional
- ✅ **GitHub OAuth**: Fully functional
- ⏳ **Phone Auth**: Pending reCAPTCHA setup

## 📋 Next Steps

1. **Complete Firebase Console setup** (above steps)
2. **Get real API keys** from Firebase project settings
3. **Configure reCAPTCHA** for phone verification
4. **Test phone authentication** with test numbers
5. **Enable phone auth** in production

---

*Phone authentication will be available once Firebase project is properly configured with reCAPTCHA.* 📱
