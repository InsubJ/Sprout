# Biometric & PIN Security App Lock

## Overview

Sprout supports application lock protection using device biometrics (`expo-local-authentication` Face ID / Touch ID) or a custom security PIN.

## App Lock Lifecycle

- **Foreground Resume**: When app returns to foreground from background, `AppLockProvider` checks lock settings.
- **Biometric Prompt**: Invokes hardware biometric prompt.
- **PIN Fallback**: Displays PIN entry keypad if biometrics fail or are disabled.

## Key Source Files

- [apps/mobile/src/providers/AppLockProvider.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/providers/AppLockProvider.tsx): Provider managing lock state and platform authentication calls.
- [apps/mobile/src/features/auth/AppLockOverlayScreen.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/auth/AppLockOverlayScreen.tsx): Full-screen lock overlay component with PIN pad.
