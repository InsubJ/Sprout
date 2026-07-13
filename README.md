# Sprout

Sprout is an Expo React Native habit tracker represented as a growing social forest.

## Application

- `apps/mobile` — Expo SDK 57 application for iOS, Android, and Expo web
- `packages/shared` — platform-independent types, Zod schemas, domain rules, and plant geometry
- `packages/services` — injected Supabase repositories and offline synchronization
- `packages/design-tokens` — shared visual tokens
- `packages/config` — shared TypeScript configuration
- `backend/supabase` — database migrations, tests, and hosted Storage policies

## Commands

```sh
npm install
npm run mobile
npm run ios
npm run android
npm run typecheck
npm run test
npm run validate:mobile
```

The app uses deterministic demo data if its Supabase environment variables are absent. See `apps/mobile/.env.example` for production configuration.

`Sprout-a-detailed-guide.md` is retained as a historical, platform-neutral product reference. The former Next.js implementation is no longer part of the repository or supported architecture.

See [`PLANT-CREATION-GUIDE.md`](PLANT-CREATION-GUIDE.md) for the complete workflow for adding a new plant species.
