# Authentication & Session Management

## Overview

Authentication is powered by Supabase Auth (`@supabase/supabase-js`) wrapped by `AuthProvider`.

## Authentication State & Guard

- **Unauthenticated State**: Redirects user to `/ (auth)/login`.
- **Onboarding Guard**: After signing in, if user profile lacks a valid username, redirects to `/username-onboarding`.
- **Authenticated State**: Directs user to `/(tabs)/forest`.

## Key Source Files

- [apps/mobile/src/providers/AuthProvider.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/providers/AuthProvider.tsx): Authentication context provider.
- [apps/mobile/src/features/auth/AuthScreen.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/auth/AuthScreen.tsx): Login / Sign Up UI component.
- [apps/mobile/app/(auth)/login.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/app/(auth)/login.tsx): Route handler for authentication.
