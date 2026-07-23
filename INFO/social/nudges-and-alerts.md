# Water Nudges & Alert Notifications

## Overview

When a friend's plant is in the `"withered"` state, a **"Send Drop" / "Water Alert"** button appears on their tree card.

## Nudge Rules & Rate Limits

1. **Withered Only**: Nudges can only be sent to habits whose status is `"withered"`.
2. **Daily Limit**: Users can send **only 1 nudge per withered tree per calendar day** to prevent notification spam.
3. **Optimistic Updates**: Sending a nudge disables the button immediately and persists the record.

## Key Source Files

- [packages/shared/src/types/nudge.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/types/nudge.ts): Nudge data interfaces.
- [packages/shared/src/utils/nudgeValidation.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/utils/nudgeValidation.ts): Validation helper for nudge creation.
- [apps/mobile/src/features/social/useFriendNudges.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/social/useFriendNudges.ts): Hook managing nudge sending and daily rate limit checks.
- [apps/mobile/src/features/habits/components/HabitCardFooter.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/habits/components/HabitCardFooter.tsx): Card footer rendering the nudge button on withered friend trees.
