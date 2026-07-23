# Dynamic Wilting Mechanics & Algorithms

## Overview

When a user neglects a habit and misses watering intervals equal to or exceeding its `wither_threshold`, the habit automatically transitions to the `"withered"` status. This is evaluated dynamically upon loading or refreshing habits.

## Wilting Calculation Algorithm

Calculated via `calculateHabitWilting(habit, lastWateredAt, now)`:

1. **Baseline Timestamp**: Uses `lastWateredAt` if available; otherwise falls back to `created_at`.
2. **Elapsed Days**: Calculates full calendar days elapsed between baseline and current time: `Math.floor((now - baseline) / 86,400,000)`.
3. **Consecutive Misses**:
   - If `lastWateredAt` exists, `consecutive_misses = Math.max(0, elapsedDays - 1)`.
   - If `lastWateredAt` is null, `consecutive_misses = elapsedDays`.
4. **Status Derivation**: Calls `deriveHabitStatus(current, target, consecutiveMisses, witherThreshold)`:
   - If `current >= target` -> `"completed"`
   - If `consecutiveMisses >= witherThreshold` -> `"withered"`
   - Otherwise -> `"healthy"`
5. **Wither Count Increment**: When status transitions from healthy to withered, `wither_count` increments by 1.

## Key Source Files

- [packages/shared/src/domain/habitStatus.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/domain/habitStatus.ts): Core functions `deriveHabitStatus` and `calculateHabitWilting`.
- [packages/shared/src/domain/habitDomain.test.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/domain/habitDomain.test.ts): Unit tests for wilting and status derivation.
- [apps/mobile/src/features/habits/hooks/useHabits.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/habits/hooks/useHabits.ts): Applies dynamic wilting calculations when returning habit state.
- [apps/mobile/src/repositories/demoHabitRepository.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/repositories/demoHabitRepository.ts): Applies wilting calculations in demo mode repository calls.
