# Sanctuary Catalogue & Completed Plants

## Overview

When a habit reaches 100% of its target waterings (`current_waterings >= target_waterings`), its status becomes `"completed"` and it moves into the permanent Sanctuary catalogue.

## Catalogue Data Flow

1. User completes final watering.
2. Status updates to `"completed"` and `completed_at` timestamp is set.
3. Habit moves out of active Forest tab into Sanctuary tab.
4. Completed plants are rendered in `GardenCarousel` without watering controls.

## Key Source Files

- [apps/mobile/src/features/sanctuary/SanctuaryScreen.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/sanctuary/SanctuaryScreen.tsx): Sanctuary screen component.
- [apps/mobile/src/features/sanctuary/useSanctuaryCatalogue.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/sanctuary/useSanctuaryCatalogue.ts): Hook filtering completed habits and custom plants.
- [apps/mobile/src/features/sanctuary/useSanctuary.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/sanctuary/useSanctuary.ts): Data hook for sanctuary habits.
