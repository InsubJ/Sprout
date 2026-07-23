# Disco Watering Flow & Rewarded Ads

## Overview

Watering the Disco Plant is performed through an interactive bottom sheet flow offering two choices:
1. **Watch an Ad**: Simulates a 30-second rewarded video ad view.
2. **Make a Donation**: Direct link to make a small environmental donation.

## Flow State Machine

`useDiscoWateringFlow(onWater, onRewardRecorded)` controls step transitions:

```text
[Choice Step] ──> ("ad") ──────> [Rewarded Video Stream] ──> [Apply Reward] ──> [Thank You Step]
              ──> ("donation")──> [Donation Form] ────────> [Apply Reward] ──> [Thank You Step]
```

## Key Source Files

- [apps/mobile/src/features/disco/hooks/useDiscoWateringFlow.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/disco/hooks/useDiscoWateringFlow.ts): State hook & `applyCompletedDiscoReward` helper.
- [apps/mobile/src/features/disco/components/DiscoWateringSheet.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/disco/components/DiscoWateringSheet.tsx): Modal sheet component.
- [apps/mobile/src/features/disco/hooks/useDiscoWateringFlow.test.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/disco/hooks/useDiscoWateringFlow.test.ts): Unit tests for reward execution.
