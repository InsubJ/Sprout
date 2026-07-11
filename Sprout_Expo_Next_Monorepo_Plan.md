# Sprout Expo + Next.js Monorepo Plan

## Project decision

Build a new **Expo + React Native frontend** for iOS, Android, and optionally web, while keeping the existing **Next.js web app** in the same repository.

This is not a direct refactor of the current frontend. Because the current app uses **Next.js, HTML elements, CSS, browser APIs, and Docker**, the Expo app should be treated as a new cross-platform frontend that reuses backend logic, shared types, validation, constants, and Supabase integration where possible.

## Target architecture

```txt
Sprout/
  apps/
    web/              # Existing Next.js web app
    mobile/           # New Expo / React Native app
  packages/
    shared/           # Shared types, constants, validation, helpers
    supabase/         # Optional shared Supabase client/helpers
  backend/            # Existing Supabase backend, migrations, functions, policies
  docker-compose.yml
  README.md
```

## Core principle

Keep the existing Next.js web app working while building the Expo app separately.

Do not mix Expo directly into the existing Next.js frontend folder.

## What stays

### Existing Next.js web app

The current frontend should remain as the production web app during development.

It can later be moved to:

```txt
apps/web/
```

### Existing Supabase backend

Keep:

- Database schema
- RLS policies
- Edge Functions
- Auth configuration
- Storage buckets
- Migrations
- Backend tests

### Docker

Docker remains useful for the web app and backend development workflow.

Docker is not used to build iOS or Android apps.

### Existing frontend as reference

Use the current Next.js app as:

- Visual reference
- User flow reference
- Feature checklist
- Business logic reference

## What changes

The new Expo app will rebuild the UI using React Native components:

| Current Next.js / Web | Expo / React Native |
|---|---|
| `div` | `View` |
| `p`, `span`, headings | `Text` |
| `button` | `Pressable` or `Button` |
| `input` | `TextInput` |
| `img` | `Image` |
| CSS / CSS Modules | `StyleSheet`, NativeWind, or RN-compatible styling |
| `window`, `document` | React Native / Expo APIs |
| `localStorage` | SecureStore or AsyncStorage |
| Browser file upload | `expo-image-picker`, `expo-file-system` |

## Phase 0: Architecture assessment

Before changing code, inspect the existing repo.

Document:

1. Current folder structure
2. Frontend screens and routes
3. Backend/Supabase structure
4. Auth flow
5. Storage/upload flow
6. Environment variables
7. Docker setup
8. Deployment process
9. Browser-only code
10. Code that can be shared with Expo

Produce a summary before implementation begins.

## Phase 1: Reorganise repo into monorepo

Recommended structure:

```txt
apps/web/
apps/mobile/
packages/shared/
backend/
```

Move the existing Next.js frontend into:

```txt
apps/web/
```

Create the Expo app in:

```txt
apps/mobile/
```

Use workspace tooling if appropriate:

- npm workspaces
- pnpm workspaces
- Turborepo, optional

Do not introduce monorepo tooling unless it clearly helps.

## Phase 2: Identify shared code

Move reusable non-UI code into `packages/shared`.

Good candidates:

- TypeScript types
- Constants
- Validation schemas
- Business rules
- Date helpers
- Formatting helpers
- Supabase table types
- Shared API helper functions

Do not share:

- Next.js pages
- Next.js server components
- HTML/CSS components
- CSS Modules
- DOM-specific logic
- Mobile screens
- Mobile navigation

## Phase 3: Create Expo app

Create the mobile app:

```bash
cd apps
npx create-expo-app@latest mobile
```

Use TypeScript.

Decide whether to use:

- Expo Router, recommended for file-based routing
- React Navigation, if more suitable

Install packages with:

```bash
npx expo install <package>
```

## Phase 4: Configure environment variables

Use separate environment values for:

- Next.js web local
- Docker web local
- Expo web local
- iOS simulator
- Android emulator
- Physical device
- Staging
- Production

For Expo, use public frontend env vars such as:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_URL=
```

Avoid hardcoded `localhost`.

Mobile apps cannot treat `localhost` the same way as the web app.

## Phase 5: Rebuild UI screen by screen

Create a feature parity checklist from the current Next.js app.

For each screen:

1. Identify the existing route/page in Next.js.
2. Identify required data.
3. Identify user actions.
4. Rebuild the screen in React Native.
5. Connect to shared logic/Supabase.
6. Test on web, iOS, and Android.
7. Mark feature as complete.

Recommended order:

1. App shell/navigation
2. Auth
3. Main dashboard/home
4. Core user flow
5. Forms
6. Image upload/check-in features
7. Settings/profile
8. Edge cases and error states

## Phase 6: Auth and storage

Review existing Supabase auth flow.

For Expo:

- Use Supabase JS client where possible.
- Store sensitive session/token data appropriately.
- Use SecureStore if needed.
- Confirm login, logout, refresh, and session restore.
- Test auth on web, iOS, Android, and physical devices.

For uploads:

- Replace browser file picker logic with Expo-compatible image/file handling.
- Use `expo-image-picker` for image selection.
- Use `expo-file-system` if file manipulation is required.
- Confirm uploaded files work with Supabase Storage.

## Phase 7: Styling system

Choose one styling strategy for Expo:

Option A:

```txt
StyleSheet
```

Option B:

```txt
NativeWind
```

Option C:

```txt
React Native compatible component library
```

Do not attempt to directly reuse CSS Modules from Next.js.

Use the existing web app as the design reference.

## Phase 8: Keep web and mobile independent

During development:

- `apps/web` remains the current production web app.
- `apps/mobile` becomes the new Expo app.
- `packages/shared` contains reusable logic.
- `backend` remains the shared Supabase backend.

Do not break the web app while building mobile.

## Phase 9: Testing

Test the Expo app on:

```bash
npx expo start
```

Then verify:

- Expo web
- iOS simulator
- Android emulator
- Physical iPhone
- Physical Android

Check:

- Navigation
- Auth
- Supabase connection
- Image upload
- Forms
- Error handling
- Offline/poor network behaviour
- Responsive layout

Also verify that the existing Next.js web app still runs.

## Phase 10: Builds

### Web

Keep the existing Dockerised Next.js deployment unless there is a strong reason to replace it.

### iOS and Android

Use EAS Build:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios
eas build --platform android
```

Create build profiles:

- development
- preview
- production

## Phase 11: Decide future web strategy

After the Expo app reaches feature parity, decide whether to:

### Option A: Keep both

- Next.js remains the main web app.
- Expo remains iOS/Android app.
- Shared logic lives in packages.

This is often best if the web app is important and already works well.

### Option B: Replace web with Expo Web

- Expo becomes web, iOS, and Android.
- Next.js frontend is retired.

Only do this if Expo Web fully satisfies the product needs.

## Final deliverables

At the end, provide:

1. Monorepo structure
2. Architecture summary
3. Shared package contents
4. Web app run instructions
5. Expo app run instructions
6. Backend/Supabase setup instructions
7. Docker instructions
8. iOS build instructions
9. Android build instructions
10. Remaining risks
11. Feature parity checklist
12. List of features not yet migrated

## Rules

- Keep the existing Next.js app working.
- Do not force Expo into the existing Next.js frontend.
- Treat Expo as a new frontend, not a direct HTML/CSS conversion.
- Reuse backend and non-UI logic where possible.
- Rebuild UI using proper React Native components.
- Keep web and mobile concerns separated.
- Use small, safe steps.
- Document every major architecture decision.
