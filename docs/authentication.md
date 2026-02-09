# Authentication Setup

## Overview

The app uses a custom authentication system with support for:
- Email/Password authentication
- Google OAuth (ready for integration)
- Apple Sign In (iOS, ready for integration)

## Current Status

✅ **Basic auth system implemented** - Mock authentication for development
🔄 **Production auth** - Ready to integrate with Supabase

## Installation

### Required Package

AsyncStorage is required for persistent authentication:

```bash
npx expo install @react-native-async-storage/async-storage
```

## Implementation Details

### Auth Context

The authentication state is managed in `contexts/AuthContext.tsx`:
- User session management
- Sign in/up methods
- Sign out functionality
- Persistent storage

### Auth Screen

The authentication UI is in `app/auth.tsx`:
- Sign up / Sign in toggle
- Social login buttons (Google, Apple)
- Email/password form

## Production Setup

### For Supabase Integration

When ready to connect to Supabase:

1. Set up Supabase project (see [Backend Setup](./backend/setup.md))
2. Update `contexts/AuthContext.tsx` to use Supabase Auth
3. Configure OAuth providers in Supabase dashboard
4. Update environment variables

### Google OAuth Setup

1. Create OAuth credentials in Google Cloud Console
2. Configure redirect URLs in Supabase
3. Update `signInWithGoogle` function in `AuthContext`

### Apple Sign In Setup

1. Configure Apple Sign In in Apple Developer Console
2. Set up in Supabase dashboard
3. Update `signInWithApple` function in `AuthContext`

## Files

- `contexts/AuthContext.tsx` - Auth state management
- `app/auth.tsx` - Authentication UI
- `lib/supabase.ts` - Supabase client (for future integration)
