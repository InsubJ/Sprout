# Sprout Mobile

Expo SDK 57 and React Native application for Sprout. The app uses Expo Router and consumes platform-independent behavior from `@sprout/shared` and injected repositories from `@sprout/services`.

## Run

From the repository root:

```sh
npm install
npm run mobile
```

Copy `.env.example` to `.env.local` and set the two public Supabase values to use production data. Without them the app starts in deterministic demo mode.

Face ID requires an iOS development build; it is not available in Expo Go. Use `eas build --profile development --platform ios` after authenticating EAS.
