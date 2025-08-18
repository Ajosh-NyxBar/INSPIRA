# 🔥 Firebase Configuration Setup Instructions

## Problem
You're getting Firebase connection errors because the web app configuration is incomplete. You have the Admin SDK credentials but need the web app config.

## Solution Steps

### 1. Get Your Firebase Web App Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `inspira-f55e4`
3. Click the gear icon ⚙️ → Project Settings
4. Scroll down to "Your apps" section
5. If you don't see a web app, click "Add app" → Web (</>) icon
6. Register the app with name: "InspiraHub Web"
7. Copy the Firebase SDK configuration object

### 2. Update Environment Variables

Replace the placeholder values in `.env.local` with your real config:

```bash
# Real Firebase Web App Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza... (your real API key)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=inspira-f55e4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=inspira-f55e4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=inspira-f55e4.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=104540757625472776872
NEXT_PUBLIC_FIREBASE_APP_ID=1:104540757625472776872:web:YOUR_REAL_APP_ID

# Disable demo mode
NEXT_PUBLIC_DEMO_MODE=false
```

### 3. Enable Required Firebase Services

In Firebase Console:
1. **Authentication** → Enable Email/Password, Google, GitHub
2. **Firestore Database** → Create in production mode
3. **Storage** → Set up with default rules

### 4. Current Issue
The app ID `yourWebAppIdHere` is a placeholder - you need the real web app ID from Firebase Console.

### 5. Quick Test
After updating the config, restart the dev server:
```bash
npm run dev
```

The authentication should work properly once you have the correct web app configuration.
