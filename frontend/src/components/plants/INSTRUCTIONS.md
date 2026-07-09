# Adding New Plants to Sprout

This guide explains how to add a new plant species to Sprout's rendering engine. Sprout's plant system is designed around the **Open/Closed Principle (OCP)**: adding a new species only requires declaring it, implementing its component, and registering it in the registry—without modifying any core rendering dispatchers.

---

## Step-by-Step Implementation

### Step 1: Declare the Species Type
Open [frontend/src/types/plant.ts](file:///c:/Users/ijeon/Documents/Sprout/frontend/src/types/plant.ts) and add the new snake_case species identifier to the `PlantSpecies` union type:

```typescript
export type PlantSpecies =
  | "pothos"
  | "spider_plant"
  // ...
  | "my_new_species"; // <-- Add your new species here
```

---

### Step 2: Implement the Plant Render Component
Create a new React component file inside `frontend/src/components/plants/` (e.g., `MyNewSpeciesPlant.tsx`).

#### Key Guidelines:
1. **Interface**: The component must implement `PlantProps` from `../../types/plant`.
2. **Growth Hook**: Use the `usePlantGrowth` custom hook to calculate the normalized growth state (`growthPercent`, `isWithered`, `isCompleted`, `finalVariant`, and `asymmetry`).
3. **Reusable Elements**: Utilize shared visual primitives located in the `./shared` folder:
   - `<GroundShadow />`: Ground ambient occlusion shadow.
   - `<PlantPot />`: Pot outline with customizable clay colors.
   - `<FlawlessAura />`: Glowing aura overlay for completed flawless variants.
   - `<Blossoms />` and `<ScarredAccents />`: Variant-specific decorators.

#### Example Component Skeleton:
```tsx
import React from "react";
import { PlantProps } from "../../types/plant";
import { usePlantGrowth } from "../../hooks/usePlantGrowth";
import GroundShadow from "./shared/GroundShadow";
import PlantPot from "./shared/PlantPot";
import FlawlessAura from "./shared/FlawlessAura";

export default function MyNewSpeciesPlant({
  currentWaterings = 0,
  targetWaterings = 30,
  witherCount = 0,
  status = "healthy",
  size = 260,
}: PlantProps) {
  // Compute normalized states using core hooks
  const { growthPercent, isWithered, isCompleted, finalVariant } = usePlantGrowth({
    currentWaterings,
    targetWaterings,
    witherCount,
    status,
  });

  const showAura = isCompleted && finalVariant === "flawless";
  const leafColor = isWithered ? "#8A8D80" : "#4A7C59";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      role="img"
      aria-label={`My New Species at ${Math.round(growthPercent)}% growth`}
    >
      {/* 1. Aura glow (behind pot & plant) */}
      {showAura && <FlawlessAura />}
      
      {/* 2. Base pot setup */}
      <GroundShadow />
      <PlantPot color="#C07A60" colorLight="#DF9C82" colorDark="#96563F" />

      {/* 3. Stem / Leaves rendering mapped to growthPercent */}
      <g>
        <line
          x1={200}
          y1={290}
          x2={200}
          y2={290 - (growthPercent * 1.5)} // Grow upwards based on percentage
          stroke={leafColor}
          strokeWidth={8}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
```

---

### Step 3: Register in the Plant Registry
Open [frontend/src/components/plants/plantRegistry.ts](file:///c:/Users/ijeon/Documents/Sprout/frontend/src/components/plants/plantRegistry.ts) and register the new mapping:

1. Import your new plant component:
```typescript
import MyNewSpeciesPlant from "./MyNewSpeciesPlant";
```

2. Register the mapping inside the `plantRegistry` export:
```typescript
export const plantRegistry: Partial<Record<PlantSpecies, ComponentType<PlantProps>>> = {
  // ...
  my_new_species: MyNewSpeciesPlant,
};
```

---

### Step 4: Map Difficulty Tiers (Optional)
If the plant should be assigned during standard habit seed planting based on difficulty, add its mappings inside [frontend/src/utils/difficulty.ts](file:///c:/Users/ijeon/Documents/Sprout/frontend/src/utils/difficulty.ts):

```typescript
const SPECIES_BY_TIER: Record<DifficultyTier, PlantSpecies[]> = {
  common: ["pothos", "spider_plant", "my_new_species"], // Add here
  uncommon: ["lavender", "sunflower", "maranta_leuconeura"],
  // ...
};
```

---

## Step 5: Verification & Compilation
Run the local test suite to ensure that your new plant component integrates seamlessly and does not violate any Design by Contract (DbC) rules:

```bash
npm run test
```

Build the optimized client bundle to ensure all imports resolve correctly for production:

```bash
npm run build
```
