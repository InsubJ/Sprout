# Habit Reflections & Watering Logs

## Overview

Each watering event creates a `HabitLog` entry. Users can attach optional written reflection notes and photo memories to their watering check-ins. These entries are preserved in the habit's Reflection Book.

## Reflection Book Modal & Empty State

- **Reflection Book Sheet**: Displays the list of historical watering logs for a habit.
- **Empty State**: When a habit has no check-in logs yet, the sheet renders `<ScreenState message="No watering check-ins yet." />` without a loading spinner (`loading = false`).

## Key Component & Hook Files

- [apps/mobile/src/features/habits/components/ReflectionBookSheet.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/habits/components/ReflectionBookSheet.tsx): Modal sheet displaying check-in history, notes, images, and empty state.
- [apps/mobile/src/features/habits/hooks/useHabitLogs.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/habits/hooks/useHabitLogs.ts): Fetches habit logs with realtime subscription refresh.
- [apps/mobile/src/features/habits/hooks/useWaterReflectionDraft.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/habits/hooks/useWaterReflectionDraft.ts): Manages active reflection note/photo draft state during watering flow.
- [apps/mobile/src/components/ScreenState.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/components/ScreenState.tsx): Reusable state view (`loading` defaults to `false`).
- [packages/shared/src/types/habitLog.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/types/habitLog.ts): `HabitLog` domain interface definitions.
