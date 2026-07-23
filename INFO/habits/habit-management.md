# Habit Management & Lifecycle

## Overview

Habits represent user routines associated with specific plant species. Each habit progresses toward a `target_waterings` count. When reached, the habit transitions to `"completed"` status and moves into the Sanctuary.

## Habit Model Fields

- `id`: Unique string identifier.
- `user_id`: Owner user ID.
- `name`: User-defined habit title.
- `description`: Optional detail string.
- `plant_type`: Assigned plant species key (e.g. `bonsai`, `pothos`, `lavender`, or custom UUID).
- `difficulty_tier`: `common` | `uncommon` | `rare` | `mythical`.
- `frequency`: `daily` | `twice_daily` | `weekly`.
- `target_waterings`: Total waterings needed to complete (e.g., 14, 30).
- `current_waterings`: Accumulated waterings count.
- `wither_threshold`: Number of missed days allowed before wilting.
- `consecutive_misses`: Current consecutive missed days count.
- `wither_count`: Total times this habit has withered in its lifetime.
- `status`: `"healthy"` | `"withered"` | `"completed"`.
- `current_streak` / `max_streak`: Consecutive watering streak counters.

## Key Source Files

- [packages/shared/src/types/habit.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/types/habit.ts): Habit TypeScript interfaces and types.
- [packages/shared/src/schemas/habitSchema.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/schemas/habitSchema.ts): Zod validation schemas for habit creation and updates.
- [apps/mobile/src/features/habits/hooks/useHabits.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/habits/hooks/useHabits.ts): Main hook managing user habits, watering mutations, and state.
- [apps/mobile/src/features/habits/screens/ForestScreen.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/habits/screens/ForestScreen.tsx): Dashboard screen rendering active garden habits.
