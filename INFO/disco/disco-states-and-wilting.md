# Disco Plant States & Wilting Rules

## Overview

The Disco Plant calculates its state based on elapsed hours since `lastWateredAt` timestamp.

## State Rules & Hours Thresholds

`computeDiscoState(lastWateredAt, now)`:
- `lastWateredAt === null`: `"withered"`
- `< 24 hours`: `"dancing"` (Full dancing animations, spinning color rays, flashing mirror ball tiles, twinkling stars).
- `24 to under 48 hours`: `"smiling"` (Static happy smile, shiny disco ball).
- `>= 48 hours`: `"withered"` (Wilting droop posture `rotate(12deg)`, bent stem, tilted & dimmed sunglasses `#757575`, and tear drop under left eye).

## Key Source Files

- [apps/mobile/src/features/disco/hooks/useDiscoPlant.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/disco/hooks/useDiscoPlant.ts): `computeDiscoState` pure function and storage hook.
- [apps/mobile/src/features/disco/hooks/useDiscoPlant.test.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/disco/hooks/useDiscoPlant.test.ts): Unit tests for state transitions.
- [apps/mobile/src/features/disco/components/DiscoPlant.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/disco/components/DiscoPlant.tsx): SVG illustration component rendering dancing vs withered visual layers.
