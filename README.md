# Sprout

Sprout is a habit tracker represented as a growing social forest.

## Applications

- `apps/mobile` — Expo SDK 57 application for iOS, Android, and Expo web
- `apps/web` — retained Next.js production reference during migration
- `packages/shared` — platform-independent types, Zod schemas, and domain rules
- `packages/services` — injected Supabase repositories and offline synchronization
- `packages/design-tokens` — shared visual tokens
- `packages/config` — shared TypeScript configuration

## Commands

```sh
npm install
npm run mobile
npm run web
npm run typecheck
npm run validate:mobile
npm run build:web
```

The mobile app uses deterministic demo data if its Supabase environment variables are absent. See `apps/mobile/.env.example` for production configuration.

The Next.js app remains in place until mobile, Expo web, physical-device testing, and production cutover gates are complete.
