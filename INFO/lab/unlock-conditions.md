# Species Unlock Conditions & Discovery Logic

## Overview

A species is unlocked in the Lab when the user has completed at least one habit of that plant species (`status === "completed"`).

## Unlock Calculation

`useLabSpecies(habits)`:
- Extracts unique `plant_type` strings from habits where `status === "completed"`.
- Returns `unlockedSpeciesSet: Set<string>`.
- Common starter species (`bonsai`, `pothos`) can also be unlocked by default.

## Key Source Files

- [apps/mobile/src/features/lab/useLabSpecies.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/lab/useLabSpecies.ts): Custom hook resolving unlocked plant species.
- [apps/mobile/src/features/lab/labSimulationStatus.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/lab/labSimulationStatus.ts): Helper for lab species status computation.
- [apps/mobile/src/features/lab/labSimulationStatus.test.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/lab/labSimulationStatus.test.ts): Unit tests for lab species unlock rules.
