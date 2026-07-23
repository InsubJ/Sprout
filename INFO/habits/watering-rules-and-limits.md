# Watering Rules & Daily Limits

## Overview

To prevent over-watering and encourage realistic habit building, habits enforce daily watering limits based on their configured frequency.

## Watering Rules

1. **Daily Frequency (`daily`)**: Maximum 1 watering allowed per calendar day (`YYYY-MM-DD` in local time).
2. **Twice-Daily Frequency (`twice_daily`)**: Maximum 2 waterings allowed per calendar day.
3. **Limit Protection**: Attempting to water past the daily limit triggers a tooltip notification ([WaterLimitTooltip.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/habits/components/WaterLimitTooltip.tsx)) and disables the watering button.

## Key Functions & Utilities

- `getWateringAvailability(frequency, wateringsToday)` in [packages/shared/src/domain/wateringLimits.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/domain/wateringLimits.ts): Pure function returning `{ limit, remaining, isLimitReached }`.
- `getLocalDateKey(date)` in [packages/shared/src/domain/dateFormatting.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/domain/dateFormatting.ts): Formats local date to `YYYY-MM-DD` key for log aggregation.

## Key Source Files

- [packages/shared/src/domain/wateringLimits.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/domain/wateringLimits.ts): Domain logic for watering availability.
- [apps/mobile/src/features/habits/components/HabitPlantScene.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/habits/components/HabitPlantScene.tsx): Renders plant scene with interactive watering button and limit tooltips.
- [apps/mobile/src/features/habits/components/WateringButton.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/habits/components/WateringButton.tsx): Watering droplet button component.
