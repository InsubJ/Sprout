# Sprout React Native Refactor Plan

## 1. Target architecture

Keep the repository as a monorepo:

```text
Sprout/
├── apps/
│   ├── web/                 # Existing Next.js app, retained temporarily
│   └── mobile/              # Expo + React Native app
├── packages/
│   ├── shared/              # Types, validation and business logic
│   ├── services/            # Supabase and domain services
│   ├── design-tokens/       # Colours, spacing, typography
│   └── config/              # Shared TypeScript and lint configuration
└── package.json
```

The existing web app should remain operational during migration.

The Expo app already exists under `apps/mobile`, but it is currently only a starter application.

---

## 2. Migration principle

This is not merely a CSS refactor.

The reusable parts are:

- TypeScript types
- Supabase services
- Validation rules
- Habit calculations
- Difficulty calculations
- Plant-selection logic
- Data models
- Hooks that do not depend on browser APIs

The parts that must be rebuilt are:

- HTML elements such as `div`, `button`, `input` and `section`
- CSS Modules
- Browser-specific APIs
- Next.js routing
- DOM event handling
- `localStorage` usage
- Web modals
- Web-specific image upload logic

Typical conversions:

```tsx
<div>       → <View>
<span>      → <Text>
<button>    → <Pressable>
<input>     → <TextInput>
<img>       → <Image>
```

CSS Modules will become React Native `StyleSheet` objects or a cross-platform styling system.

---

# Phase 1 — Stabilise the monorepo

## Step 1.1: Define the final workspace structure

Keep:

```text
apps/web
apps/mobile
packages/shared
```

Add:

```text
packages/services
packages/design-tokens
packages/config
```

Do not delete the Next.js app yet.

## Step 1.2: Standardise commands

Add root scripts such as:

```json
{
  "scripts": {
    "web": "npm run dev --workspace apps/web",
    "mobile": "npm run start --workspace apps/mobile",
    "ios": "npm run ios --workspace apps/mobile",
    "android": "npm run android --workspace apps/mobile",
    "test": "npm run test --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present"
  }
}
```

## Step 1.3: Align TypeScript versions

The apps currently use different React and TypeScript generations.

Do not blindly force all packages to one React version. Instead:

- Keep React as an app-level dependency.
- Keep shared packages free of React where possible.
- Use compatible TypeScript settings in a shared base configuration.
- Verify Expo SDK compatibility before upgrading dependencies.

## Step 1.4: Add CI checks

Every pull request should run:

```text
install
typecheck shared packages
test shared packages
build Next.js
validate Expo configuration
run mobile tests
```

---

# Phase 2 — Extract platform-independent code

## Step 2.1: Audit the web code

Classify each file into one of four categories:

| Category | Action |
|---|---|
| Pure TypeScript logic | Move to `packages/shared` |
| Supabase/data access | Move to `packages/services` |
| React logic without DOM dependencies | Consider sharing |
| UI or browser-specific logic | Rebuild for React Native |

## Step 2.2: Expand `@sprout/shared`

Move the following into it:

```text
packages/shared/src/
├── types/
│   ├── habit.ts
│   ├── profile.ts
│   ├── log.ts
│   └── reflection.ts
├── schemas/
│   ├── habitSchema.ts
│   ├── profileSchema.ts
│   └── logSchema.ts
├── domain/
│   ├── difficulty.ts
│   ├── wateringLimits.ts
│   ├── habitProgress.ts
│   ├── habitStatus.ts
│   └── plantAssignment.ts
├── formatting/
│   ├── plantFormatting.ts
│   └── dateFormatting.ts
└── index.ts
```

## Step 2.3: Remove browser assumptions from shared logic

Shared packages must not use:

```ts
window
document
localStorage
sessionStorage
navigator
HTMLElement
FileReader
```

Pass required values into shared functions instead.

For example, replace:

```ts
const stored = localStorage.getItem('sprout_logs');
```

with:

```ts
const wateringsToday = await logRepository.countForHabitToday(habitId);
```

That avoids having separate watering-limit logic on web and mobile.

---

# Phase 3 — Create a shared service layer

## Step 3.1: Move Supabase setup

Create:

```text
packages/services/src/
├── supabase/
│   ├── client.ts
│   ├── auth.ts
│   ├── storage.ts
│   └── database.types.ts
├── repositories/
│   ├── habitRepository.ts
│   ├── logRepository.ts
│   ├── profileRepository.ts
│   └── reflectionRepository.ts
└── index.ts
```

## Step 3.2: Use dependency injection

Avoid constructing services directly inside screens.

Use interfaces:

```ts
export interface HabitRepository {
  getByUserId(userId: string): Promise<Habit[]>;
  create(input: CreateHabitInput): Promise<Habit>;
  update(id: string, input: UpdateHabitInput): Promise<Habit>;
}
```

Then inject a Supabase implementation.

This makes it easier to support:

- Production Supabase
- Offline storage
- Tests
- Mock/demo mode

## Step 3.3: Configure mobile Supabase correctly

Use Expo-compatible environment variables:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Store authentication sessions using a React Native storage adapter rather than browser `localStorage`.

## Step 3.4: Generate database types

Generate Supabase TypeScript types and consume them from both apps.

Do not independently maintain web and mobile database interfaces.

---

# Phase 4 — Build the mobile application shell

## Step 4.1: Add Expo Router

Replace the current single `App.tsx` starter with route-based navigation:

```text
apps/mobile/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── forest.tsx
│       ├── sanctuary.tsx
│       ├── buds.tsx
│       ├── lab.tsx
│       └── profile.tsx
├── src/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── providers/
│   └── theme/
└── assets/
```

## Step 4.2: Reproduce the bottom navigation

Create five tabs:

```text
Forest
Sanctuary
Buds
Lab
Profile
```

Use native tab navigation rather than a fixed web footer.

## Step 4.3: Add application providers

The root layout should provide:

```text
AuthProvider
SupabaseProvider
ThemeProvider
Query/data provider
SafeAreaProvider
GestureHandlerRootView
```

## Step 4.4: Configure deep linking

Define a stable scheme:

```json
{
  "expo": {
    "scheme": "sprout"
  }
}
```

This can later support:

```text
sprout://habit/{id}
sprout://profile/{id}
sprout://reflection/{id}
```

---

# Phase 5 — Establish the design system

## Step 5.1: Extract design tokens

Convert CSS variables into TypeScript tokens:

```ts
export const colors = {
  forest: '#2d5a27',
  evergreen: '#1b3b2b',
  sand: '#faf7f2',
  cardDark: '#1b2739',
  backgroundDark: '#0d1729',
};
```

Also extract:

```text
spacing
border radii
font sizes
font weights
shadows
animation durations
breakpoints
```

## Step 5.2: Preserve colour schemes

Components such as HabitCard and DiscoHabitCard should share interaction styles but retain separate themes.

```ts
const habitTheme = {
  buttonBackground: colors.forest,
  buttonHover: colors.evergreen,
};

const discoTheme = {
  buttonBackground: colors.purple,
  buttonHover: colors.deepPurple,
};
```

React Native does not have CSS hover on touch devices. Translate interactions as:

- Normal
- Pressed
- Disabled
- Focused
- Hovered on web only

Use `Pressable`:

```tsx
<Pressable
  style={({ pressed, hovered }) => [
    styles.button,
    hovered && styles.hovered,
    pressed && styles.pressed,
  ]}
/>
```

## Step 5.3: Build base components first

Create reusable components:

```text
AppButton
IconButton
Card
Badge
ProgressBar
ModalSheet
TextField
SearchField
EmptyState
LoadingState
ErrorState
Avatar
```

Do not migrate every page with duplicated styling.

---

# Phase 6 — Migrate authentication

## Step 6.1: Rebuild login UI

Convert the Next.js login screen into a native screen using:

```text
SafeAreaView
KeyboardAvoidingView
ScrollView
TextInput
Pressable
```

## Step 6.2: Implement Supabase authentication

Support:

- Email authentication
- Session restoration
- Logout
- Protected routes
- OAuth where needed

## Step 6.3: Replace simulated biometric logic

Use actual device authentication through Expo Local Authentication.

Flow:

```text
App launches
→ restore Supabase session
→ check whether app lock is enabled
→ request Face ID / Touch ID / device biometrics
→ reveal protected routes
```

Retain PIN fallback where required.

## Step 6.4: Configure OAuth redirects

Mobile OAuth redirects must use the app scheme rather than a normal browser URL.

Test separately on:

- Development build
- iOS simulator
- Physical iPhone
- Production build

---

# Phase 7 — Migrate the dashboard

## Step 7.1: Recreate the dashboard layout

Build:

```text
Search field
Filter chips
Garden carousel
Plant New Seed button
Stats section
Habit cards
Bottom tabs
```

Do not attempt a pixel-for-pixel CSS conversion. Recreate the same behaviour with native layout primitives.

## Step 7.2: Build a native garden carousel

Use:

```tsx
<FlatList
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
/>
```

Prefer `FlatList` over mapping all cards inside a horizontal `ScrollView`.

## Step 7.3: Place the mobile seed button correctly

The desired mobile hierarchy should be:

```text
Carousel
Plant New Seed button
Stats
```

Represent this directly in JSX rather than relying on CSS `order`.

```tsx
<GardenCarousel />
<PlantSeedButton />
<StatsBar />
```

## Step 7.4: Replace web responsive CSS

Use:

- `useWindowDimensions`
- Flexible width
- `FlatList` column counts
- Platform-specific styles only where necessary

Avoid fixed screenshot dimensions.

---

# Phase 8 — Migrate HabitCard

## Step 8.1: Separate data logic from presentation

Create:

```text
features/habits/
├── hooks/
│   ├── useHabitCard.ts
│   └── useWaterHabit.ts
├── components/
│   ├── HabitCard.tsx
│   ├── HabitStatusBadge.tsx
│   ├── HydrationDots.tsx
│   ├── WateringButton.tsx
│   └── PlantVisual.tsx
└── screens/
    └── HabitDetailsScreen.tsx
```

## Step 8.2: Replace DOM elements

```tsx
<View style={styles.card}>
  <View style={styles.header}>
    <Text style={styles.name}>{name}</Text>
    <HabitStatusBadge status={status} />
  </View>
</View>
```

## Step 8.3: Rebuild watering interaction

Use a shared `WateringButton` component with theme props:

```tsx
<WateringButton
  disabled={isLimitReached}
  theme="forest"
  onPress={openWaterModal}
/>
```

For the disco plant:

```tsx
<WateringButton
  theme="disco"
  onPress={openDiscoModal}
/>
```

This ensures:

- Same rotation
- Same press animation
- Same disabled behaviour
- Different colour scheme

## Step 8.4: Replace hover tooltip behaviour

Mobile devices do not have hover.

For a disabled watering limit:

- Keep the visual disabled state.
- Allow a surrounding `Pressable` to receive taps.
- Show a toast or small popover stating that the daily limit was reached.

## Step 8.5: Port SVGs

Use `react-native-svg`.

```tsx
import Svg, { Path } from 'react-native-svg';

export function WateringCanIcon({ flipped = true }) {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      style={flipped ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      {/* paths */}
    </Svg>
  );
}
```

---

# Phase 9 — Migrate forms and modals

## Step 9.1: Habit creation form

Recommended mobile interaction:

```text
Tap Plant New Seed
→ open modal sheet
→ enter habit details
→ validate with shared Zod schema
→ create habit
→ close sheet
→ refresh carousel
```

## Step 9.2: Replace HTML form semantics

React Native has no `<form>` submission.

```tsx
const handleSubmit = async () => {
  const result = habitSchema.safeParse(values);

  if (!result.success) {
    setErrors(formatErrors(result.error));
    return;
  }

  await createHabit(result.data);
};
```

## Step 9.3: Keyboard handling

Every significant form should account for:

```text
keyboard avoidance
scrolling to invalid fields
safe areas
input focus
return-key behaviour
```

## Step 9.4: Migrate confirmation and reflection modals

Convert:

```text
WaterConfirmModal
ReflectionBookModal
CompletionCelebrationModal
DiscoWateringModal
```

to either native modal screens or bottom sheets.

Use navigation screens for complex content and sheets for short interactions.

---

# Phase 10 — Images and storage

## Step 10.1: Select images natively

Use Expo Image Picker for:

- Camera
- Photo library
- Permissions

## Step 10.2: Compress uploads

Before uploading check-in photos:

```text
resize
reduce quality
strip unnecessary metadata
generate stable filename
upload to Supabase Storage
```

## Step 10.3: Handle mobile file formats

Do not assume browser `File` objects.

```ts
type UploadAsset = {
  uri: string;
  mimeType?: string;
  fileName?: string;
};
```

Then convert the local URI into uploadable binary data.

## Step 10.4: Cache remote images

Use Expo Image or another supported image component for better caching and loading behaviour.

---

# Phase 11 — Offline support

## Step 11.1: Decide the offline scope

A realistic first version should support:

- Viewing previously loaded habits
- Drafting a watering log
- Queuing a watering action
- Retrying when the connection returns
- Showing pending-sync state

Do not assume full offline Supabase support automatically.

## Step 11.2: Add local persistence

Use a local database or structured storage for:

```text
cached habits
queued logs
pending photos
last successful sync
user preferences
```

For simple early migration, AsyncStorage may be sufficient. For stronger offline querying and syncing, use SQLite.

## Step 11.3: Introduce a sync queue

```ts
{
  id: string;
  type: 'CREATE_LOG' | 'CREATE_HABIT' | 'UPDATE_HABIT';
  payload: unknown;
  createdAt: string;
  retries: number;
  status: 'pending' | 'syncing' | 'failed';
}
```

## Step 11.4: Make writes idempotent

Generate client-side IDs so retrying an upload or watering action does not create duplicates.

---

# Phase 12 — Notifications

Add local and push notifications after the main flows work.

Potential notifications:

```text
habit watering reminder
habit about to wither
friend nudge
plant fully grown
weekly progress summary
```

Store notification preferences per habit.

Do not make notifications part of the first UI migration milestone.

---

# Phase 13 — Testing

## Shared package tests

Test:

```text
watering limits
progress calculation
difficulty tier
plant assignment
status transitions
validation schemas
```

## Component tests

Test:

```text
HabitCard renders correctly
watering button disabled state
watering modal opens
new habit form validation
private habit visibility
disco plant state
```

## Integration tests

Test:

```text
login
load habits
create habit
water habit
upload reflection image
complete habit
logout and session restore
```

## Device testing

Test on:

```text
small iPhone
large iPhone
iPad if supported
Android phone
dark mode
large accessibility text
slow network
offline mode
```

---

# Phase 14 — iOS build configuration

## Step 14.1: Update Expo identity

```json
{
  "expo": {
    "name": "Sprout",
    "slug": "sprout",
    "ios": {
      "bundleIdentifier": "com.insubj.sprout",
      "supportsTablet": true
    },
    "android": {
      "package": "com.insubj.sprout"
    }
  }
}
```

## Step 14.2: Add EAS configuration

Create:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

## Step 14.3: Create development builds

Use Expo Go only while all dependencies remain Expo Go-compatible.

Once adding native modules, use a development build:

```bash
eas build --profile development --platform ios
```

## Step 14.4: Prepare App Store requirements

Before release:

```text
Apple Developer account
bundle identifier
app icon
splash screen
privacy policy
data-use disclosures
camera/photo permission descriptions
sign-in configuration
App Store screenshots
TestFlight testing
```

---

# Phase 15 — Validation and cutover

## Milestone 1: Mobile shell

Complete when:

- Expo Router works
- Tabs work
- Theme works
- Supabase session restores
- iOS development build launches

## Milestone 2: Core habit flow

Complete when:

- Habits load
- Carousel works
- HabitCard works
- Users can create habits
- Users can water habits
- Limits are enforced

## Milestone 3: Feature parity

Complete when:

- Reflections work
- Images upload
- Profiles work
- Friends and nudges work
- Disco plant works
- Completion flow works
- Privacy controls work

## Milestone 4: Mobile production readiness

Complete when:

- Offline queue works
- Error states are reliable
- Accessibility is tested
- Analytics and logging are configured
- TestFlight testing passes
- Privacy documentation is complete

## Milestone 5: Expo web validation

Once the React Native app is stable, run it for web and compare it with the existing Next.js application.

Validate:

```text
desktop navigation
responsive layouts
forms
authentication redirects
SEO requirements
accessibility
performance
Supabase behaviour
```

## Milestone 6: Retire Next.js

Delete `apps/web` only after:

- Every required feature exists in Expo.
- Mobile and Expo web are stable.
- Production traffic has moved.
- Rollback is no longer required.
- Web-specific SEO requirements have been addressed.

Until then, Next.js remains the production reference implementation.

---

# Recommended implementation order

```text
1. Clean monorepo configuration
2. Expand shared package
3. Extract Supabase service layer
4. Configure Expo Router
5. Implement authentication
6. Add shared design tokens
7. Build dashboard shell
8. Build HabitCard and watering flow
9. Build habit creation form
10. Add reflections and photo uploads
11. Add profiles, friends and nudges
12. Add disco plant
13. Add offline queue
14. Configure EAS and TestFlight
15. Validate Expo web
16. Retire Next.js
```

## Key rule

Do not migrate files one-for-one from Next.js into Expo.

For each feature:

```text
extract business logic
write shared tests
build native UI
connect shared services
test on iOS
compare behaviour with the web app
mark the feature migrated
```

This approach allows Sprout to become a genuine React Native application while keeping the current web product operational throughout the transition.
