# Firebase Troubleshooting Guide

## Current Issue: Firestore 400 Bad Request Error

### Symptoms
- `GET https://firestore.googleapis.com/...` returns 400 Bad Request
- `Failed to get document because the client is offline`
- WebChannelConnection transport errors

### Root Causes & Solutions

#### 1. Firestore Security Rules
**Problem**: Default rules may be blocking requests
**Solution**: Update Firestore rules to allow authenticated users

```javascript
// Go to Firebase Console > Firestore Database > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users to read/write (for testing)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 2. Firebase Authentication Not Enabled
**Problem**: User not authenticated when trying to access Firestore
**Solution**: Enable Anonymous Authentication

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable "Anonymous" authentication
3. This allows testing without requiring email/password

#### 3. Firestore Database Not Created
**Problem**: Firestore database doesn't exist
**Solution**: Create Firestore Database

1. Go to Firebase Console > Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select region closest to you

#### 4. API Key Restrictions
**Problem**: API key may have domain restrictions
**Solution**: Check API key settings

1. Go to Google Cloud Console > APIs & Services > Credentials
2. Find your API key: `AIzaSyC2v6tIowAQLJV9PVC8gVOE0bFiTJ45Tko`
3. Ensure "HTTP referrers" includes `localhost:3000`

### Quick Fix Steps

1. **Test Firebase Connection**
   ```
   Visit: http://localhost:3000/firebase-test
   Run the connection test
   ```

2. **Enable Anonymous Auth** (easiest for testing)
   - Firebase Console > Authentication > Sign-in method
   - Enable Anonymous authentication

3. **Update Firestore Rules** (temporary for testing)
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true; // ONLY FOR TESTING
       }
     }
   }
   ```

4. **Clear Browser Cache**
   - Open Developer Tools (F12)
   - Right-click refresh button → "Empty Cache and Hard Reload"

### Testing Order
1. Test with Firebase test page: `/firebase-test`
2. Enable Anonymous auth if needed
3. Update Firestore rules if needed
4. Test main app authentication

### Production Security
After testing works, update rules to be more secure:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /quotes/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
