# Plant God Custom Plant Generation Flow

## Overview

The Plant God is a mythical entity in the Sprout universe that allows users to create entirely custom plant species using natural language prompts (e.g. "A glowing crystal lotus with nebular petals").

## Generation Lifecycle

```text
[User Prompts Plant God]
       │
       ▼
[Check Credits / Eligibility] ──(No credits)──> [Show Credit Sheet / Stripe Checkout]
       │
       ▼
[Create Generation Job (status: "queued")]
       │
       ▼
[Poll Supabase Edge Function]
       │
       ▼
[Job Status: "generating" -> "preview_ready"]
       │
       ▼
[User Previews Custom SVG & Names Plant]
       │
       ▼
[Save Custom Plant & Attach to Habit]
```

## Key Source Files

- [apps/mobile/src/features/customPlants/components/PlantGodGenerationFlow.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/customPlants/components/PlantGodGenerationFlow.tsx): UI flow component for prompt input, loading, and preview.
- [apps/mobile/src/features/customPlants/hooks/usePlantGeneration.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/customPlants/hooks/usePlantGeneration.ts): Polling hook for tracking generation job progress.
- [apps/mobile/src/features/customPlants/hooks/useGenerationEligibility.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/customPlants/hooks/useGenerationEligibility.ts): Checks if Plant God mode is unlocked and user has available credits.
