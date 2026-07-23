# Username Onboarding & Validation

## Overview

New users must register a unique handle (e.g. `@gardener_sam`) before accessing the social forest.

## Validation & Constraints

- **Length**: 3 to 20 characters.
- **Allowed Characters**: Lowercase alphanumeric and underscores (`^[a-z0-9_]+$`).
- **Uniqueness Check**: Verified via `profileRepository.getByUsername`.

## Key Source Files

- [apps/mobile/src/features/auth/UsernameOnboardingScreen.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/auth/UsernameOnboardingScreen.tsx): Onboarding screen UI.
- [apps/mobile/src/features/auth/useUsernameOnboarding.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/auth/useUsernameOnboarding.ts): Hook managing handle availability check and profile creation.
- [packages/shared/src/schemas/profileSchema.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/schemas/profileSchema.ts): Zod schema for profile validation.
