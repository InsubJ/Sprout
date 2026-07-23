# Native Plant Renderer Engine

## Overview

Plant illustrations are dynamically rendered using `react-native-svg`. The `PlantRenderer` component maps habit status and growth properties to species-specific SVG components.

## Normalization & Registry Lookup

`normalizePlantSpecies(value)`:
1. Normalizes string input (lowercases, converts spaces/hyphens to underscores).
2. Looks up normalized key in `nativePlantRegistry`.
3. If not found in native registry, checks if it's a custom plant UUID or defaults to `"bonsai"`.

## Key Component Files

- [apps/mobile/src/features/plants/components/PlantRenderer.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/plants/components/PlantRenderer.tsx): Central dispatcher component for native plant SVG rendering.
- [apps/mobile/src/features/plants/plantRegistry.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/plants/plantRegistry.ts): Registry mapping species identifiers to React components and human-readable names.
- Native Species Components:
  - [BonsaiPlant.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/plants/components/BonsaiPlant.tsx)
  - [PothosPlant.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/plants/components/PothosPlant.tsx)
  - [LavenderPlant.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/plants/components/LavenderPlant.tsx)
  - [SpiderPlant.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/plants/components/SpiderPlant.tsx)
  - [SunflowerPlant.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/plants/components/SunflowerPlant.tsx)
  - [RemyPlant.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/plants/components/RemyPlant.tsx)
  - [SprigPlant.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/plants/components/SprigPlant.tsx)
  - [JasonPlant.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/plants/components/JasonPlant.tsx)
