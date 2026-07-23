# State Management & Provider Hierarchy

## Overview

Application state is composed through React Context Providers ordered by strict dependency flow in the root layout file [apps/mobile/app/_layout.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/app/_layout.tsx).

## Provider Hierarchy

```text
AppErrorBoundary
└── GestureHandlerRootView
    └── SafeAreaProvider
        └── ThemeProvider            (Light/Dark theme preferences & color tokens)
            └── ServicesProvider     (Dependency Injection for Repositories & Services)
                └── DataProvider     (Cache revision counter & cross-feature invalidation)
                    └── SyncProvider (Network status monitor & offline operation queue flush)
                        └── AuthProvider (Supabase session, sign in, sign out, and auth state)
                            └── AppLockProvider (Biometric & PIN security lock screen)
                                └── Router Stack (Expo Router file-based routing)
```

## Key Provider Implementation Files

- [ThemeProvider.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/providers/ThemeProvider.tsx): Manages theme selection (system, light, dark) and exposes current theme tokens.
- [ServicesProvider.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/providers/ServicesProvider.tsx): Injects either real Supabase repositories or in-memory demo repositories depending on environment variables.
- [DataProvider.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/providers/DataProvider.tsx): Maintains a global `revision` integer that triggers refetching across habits, sanctuary, and friends lists when invalidated.
- [SyncProvider.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/providers/SyncProvider.tsx): Listens for network connectivity and executes queued offline mutations.
- [AuthProvider.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/providers/AuthProvider.tsx): Tracks Supabase user session and authentication tokens.
- [AppLockProvider.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/providers/AppLockProvider.tsx): Controls screen lock overlay when biometric or passcode lock is enabled.
