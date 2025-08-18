# Login Troubleshooting Guide

## Current Issues Fixed

### 1. Firebase Authentication Error: `auth/admin-restricted-operation`

**Problem**: Anonymous authentication is not enabled in Firebase Console.

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `inspira-f55e4`
3. Navigate to **Authentication** > **Sign-in methods**
4. Enable **Anonymous** authentication
5. Save the changes

### 2. Firestore Connection Errors (400 Bad Request)

**Problem**: WebChannel connection errors causing database failures.

**Solutions Applied**:
- Updated Firebase configuration for better error handling
- Added connection retry logic
- Improved offline/online state management
- Enhanced error logging for better debugging

### 3. Environment Configuration

**Fixed Issues**:
- Corrected storage bucket URL in `.env` file
- Matched Firebase configuration between files
- Added proper fallback values

## Testing the Fix

1. **Run the Firebase Test Page**:
   - Navigate to `/firebase-test` in your app
   - Click "Run Connection Test"
   - Check for successful authentication and database operations

2. **Check Main App Login**:
   - Try logging in with email/password
   - Try Google OAuth login
   - Try GitHub OAuth login

## Common Error Codes and Solutions

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/admin-restricted-operation` | Authentication method disabled | Enable Anonymous auth in Firebase Console |
| `permission-denied` | Firestore security rules blocking | Check Firestore rules |
| `unavailable` | Firebase service down | Wait or check Firebase status |
| `failed-precondition` | Client offline | Check internet connection |
| `400 Bad Request` | Network/configuration issue | Check API keys and project settings |

## Environment Variables to Verify

Ensure these are set correctly in your `.env` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC2v6tIowAQLJV9PVC8gVOE0bFiTJ45Tko
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=inspira-f55e4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=inspira-f55e4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=inspira-f55e4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=466689963083
NEXT_PUBLIC_FIREBASE_APP_ID=1:466689963083:web:9775a8fdb8089c65b849ce
```

## Firebase Console Setup Required

1. **Authentication Settings**:
   - Enable Anonymous authentication
   - Enable Email/Password authentication
   - Configure Google OAuth (if using)
   - Configure GitHub OAuth (if using)

2. **Firestore Database**:
   - Database should be in production mode
   - Security rules updated to allow test documents
   - Network access enabled

3. **Project Settings**:
   - Verify all configuration values match your `.env` file
   - Check that the project is active and billing is set up if required

## Still Having Issues?

1. Clear browser cache and localStorage
2. Check browser console for detailed error messages
3. Verify internet connection
4. Check Firebase project status at [Firebase Status](https://status.firebase.google.com/)
5. Try the Firebase test page to isolate the issue

## Files Modified for This Fix

- `.env` - Updated storage bucket URL
- `src/lib/firebase.ts` - Enhanced connection handling
- `src/lib/firebaseConnectionHandler.ts` - Added WebChannel error handling
- `src/lib/firebaseUserService.ts` - Improved offline error handling
- `src/app/firebase-test/page.tsx` - Better error reporting and debugging
- `firestore.rules` - Added test document permissions
