# Plant Growth State & Visual Variants

## Overview

Visual growth features are derived by passing plant parameters to `getGrowthState(props)` in `@sprout/shared`.

## Growth Calculation Rules

1. **`growthPercent`**: `Math.max(0, Math.min(100, (currentWaterings / targetWaterings) * 100))`.
2. **`isWithered`**: True if `status === "withered"`.
3. **`isCompleted`**: True if `status === "completed"`.
4. **`finalVariant`**:
   - `witherCount <= 1`: `"flawless"` (pristine growth, radiant aura upon completion).
   - `witherCount <= 3`: `"steady"` (resilient growth, minor scars).
   - `witherCount > 3`: `"scarred"` (weathered growth, visible scars and asymmetry).
5. **`asymmetry`**: `Math.min(witherCount * 4, 20)` — introduces slight structural distortion representing historical wilting events.

## Key Source Files

- [packages/shared/src/utils/getGrowthState.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/utils/getGrowthState.ts): Pure function deriving growth percentage, variants, and asymmetry.
- [apps/mobile/src/features/plants/shared/FlawlessAura.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/plants/shared/FlawlessAura.tsx): Radiant SVG aura rendered around completed flawless plants.
- [apps/mobile/src/features/plants/shared/ScarredAccents.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/plants/shared/ScarredAccents.tsx): Scar details rendered for scarred variants.
