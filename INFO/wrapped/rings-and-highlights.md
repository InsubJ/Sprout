# Tree Rings & Plant Highlight Calculations

## Overview

Tree rings represent the depth of consistency built over the year.

## Ring Counting Math

- **Rings Formula**: `rings = Math.floor(totalWaterings / 10)` representing annual growth rings.
- **Highlight Selection**: Selects the completed habit with the highest `max_streak` or highest watering count created in that year.

## Key Source Files

- [apps/mobile/src/features/wrapped/useNativeYearlyWrapped.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/wrapped/useNativeYearlyWrapped.ts): Calculates ring counts and selects highlight plant.
- [apps/mobile/src/features/wrapped/WrappedStatCard.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/wrapped/WrappedStatCard.tsx): Stat card visual component.
