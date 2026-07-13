# Creating a New Sprout Plant

This is the complete workflow for adding a plant species to the supported Expo application.

The architectural boundary is:

- `packages/shared` owns species contracts, tier assignment, and pure geometry.
- `apps/mobile` owns the React Native SVG renderer and native visual composition.
- Existing shared geometry and native plant parts must be reused before adding new calculations or components.
- Do not create a cross-platform renderer abstraction. Sprout currently supports the native renderer only.

## Custom plant generation composition

When this guide is used to instruct an LLM that returns a declarative custom-plant specification:

- produce a full mature specimen, not a sparse icon;
- deliberately choose among a tree, shrub, vine, cactus or succulent, flowering plant, leafy plant, or fantasy botanical hybrid instead of defaulting to flowers;
- record that choice as `generationMetadata.archetype`; explicit tree terms such as oak, eucalyptus, willow, bonsai, pine, maple, cedar, forest, canopy, or trunk must select `tree`;
- build trees with one primary `tree` layer near the upper centre; trusted Sprout geometry expands it into the substantial trunk, branches, and canopy;
- use the native geometry labels `oak`, `eucalyptus`, `willow`, `bonsai`, `needle`, or `fantasy_tree` for trees and `oval`, `lanceolate`, `heart`, `round`, `eucalyptus`, or `needle` for leaf silhouettes;
- reserve radial blooms and blossom-heavy compositions for prompts that actually request flowers;
- use roughly 8-18 purposeful layers and 30-90 rendered primitives;
- fill the central canvas, reaching approximately `y=70-120` at the top, `y=260-300` at the bottom, and both sides around `x=90-310`;
- include a clear structural body, foliage or bloom groupings at multiple heights, and a restrained set of accents;
- vary anchors, scale, rotation, colour, and z-index instead of stacking layers at one point;
- when appropriate to the requested mood, use one contrasting `face` layer and up to two `accessory` layers (`crown`, `hat`, or `bow`) for gentle anthropomorphism while keeping the botanical silhouette dominant;
- keep the silhouette substantial and readable when rendered at 230 pixels inside a card;
- remain inside the existing schema and safety limits: no code, SVG paths, external assets, URLs, or event handlers.

## 1. Define the plant before coding

Record these decisions first:

| Decision           | Example                                 |
| ------------------ | --------------------------------------- |
| Species key        | `moon_orchid`                           |
| Display name       | `Moon Orchid`                           |
| Difficulty tier    | `rare`                                  |
| Core silhouette    | Stalk with radial blooms                |
| Healthy palette    | Green stem, violet flowers              |
| Withered palette   | Muted olive and grey-violet             |
| Growth behavior    | Stem rises, leaves appear, flowers open |
| Flawless treatment | Aura or blossoms                        |
| Steady treatment   | Normal completed form                   |
| Scarred treatment  | Asymmetry and scar accents              |

The species key is persisted in `habits.plant_type`. It must:

- use lowercase `snake_case`;
- be stable once released;
- contain no more than 50 characters;
- match the `PlantSpecies` value, tier list entry, and registry key exactly.

Do not rename a released species key without a database migration and data backfill.

## 2. Search for reusable geometry and parts

Before creating files, inspect:

- `packages/shared/src/utils/plantGeometry/`
- `apps/mobile/src/features/plants/shared/`
- existing renderers in `apps/mobile/src/features/plants/components/`

Check specifically for reusable:

- trunks and branches;
- stalks and vines;
- radial leaves and blooms;
- blossom positions;
- humanoid or animal bodies;
- pots, stools, and ground shadows;
- flawless auras, sparkles, petals, and blossoms;
- scar accents.

Use an existing calculation when it expresses the same visual knowledge. Add new geometry only when the plant has a genuinely different growth model.

## 3. Add the species contract

Add the key to `PlantSpecies` in:

`packages/shared/src/types/plant.ts`

```ts
export type PlantSpecies = "existing_species" | "moon_orchid";
```

Do not add renderer logic to this file. It contains types only.

## 4. Assign the difficulty tier

Add the key exactly once to `TIER_SPECIES` in:

`packages/shared/src/utils/difficulty.ts`

```ts
export const TIER_SPECIES: Record<DifficultyTier, PlantSpecies[]> = {
  common: [
    /* ... */
  ],
  uncommon: [
    /* ... */
  ],
  rare: [, /* ... */ "moon_orchid"],
  mythical: [
    /* ... */
  ],
};
```

This controls:

- automatic species assignment;
- Lab rarity display and sorting;
- `getTierForSpecies`;
- difficulty-domain tests.

Every `PlantSpecies` must belong to one and only one tier.

## 5. Add pure geometry when required

Skip this step if existing geometry is sufficient.

Create one specifically named file under:

`packages/shared/src/utils/plantGeometry/`

Example:

`moonOrchidGeometry.ts`

Geometry functions must:

- be pure and deterministic;
- have explicit input and return types;
- validate or safely constrain boundary inputs;
- return coordinates, paths, counts, rotations, or dimensions—not JSX;
- have no React, React Native, SVG, storage, or service dependency;
- keep output invariants valid across 0–100% growth;
- use `asymmetry` only for intentional setback variation.

Example:

```ts
export interface MoonOrchidGeometry {
  stemPath: string;
  leafPositions: Array<{ x: number; y: number; rotation: number }>;
  bloomPositions: Array<{ x: number; y: number; scale: number }>;
}

export function computeMoonOrchidGeometry(
  growthPercent: number,
  asymmetry: number,
): MoonOrchidGeometry {
  const growth = Math.max(0, Math.min(100, growthPercent));
  const safeAsymmetry = Math.max(0, Math.min(20, asymmetry));

  // Return deterministic geometry derived from the constrained inputs.
  return {
    stemPath: "M200 300 L200 220",
    leafPositions: [],
    bloomPositions: [],
  };
}
```

Export new geometry from:

`packages/shared/src/index.ts`

Add focused unit tests for important geometry invariants, such as:

- no negative element counts;
- growth values remain inside the view box;
- later growth produces at least as much visible structure as early growth;
- asymmetry remains bounded;
- output is deterministic for identical inputs.

## 6. Create the native SVG renderer

Create one renderer file under:

`apps/mobile/src/features/plants/components/`

Example:

`MoonOrchidPlant.tsx`

The renderer must accept only `PlantProps` and return a native SVG composition.

```tsx
import Svg, { Path } from "react-native-svg";
import { computeMoonOrchidGeometry, getGrowthState, type PlantProps } from "@sprout/shared";
import { FlawlessAura } from "../shared/FlawlessAura";
import { GroundShadow } from "../shared/GroundShadow";
import { PlantPot } from "../shared/PlantPot";
import { ScarredAccents } from "../shared/ScarredAccents";

export function MoonOrchidPlant(props: PlantProps): React.JSX.Element {
  const { size = 260 } = props;
  const growth = getGrowthState(props);
  const geometry = computeMoonOrchidGeometry(growth.growthPercent, growth.asymmetry);

  const stemColor = growth.isWithered ? "#8E9277" : "#477A45";

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      accessibilityLabel={`Moon Orchid at ${Math.round(growth.growthPercent)}% growth`}
    >
      {growth.isCompleted && growth.finalVariant === "flawless" ? (
        <FlawlessAura color="#8066B3" />
      ) : null}

      <GroundShadow />
      <PlantPot color="#8B6F47" colorLight="#A9835A" colorDark="#6B4A2F" />

      <Path
        d={geometry.stemPath}
        stroke={stemColor}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {growth.isCompleted && growth.finalVariant === "scarred" ? (
        <ScarredAccents marks={[{ cx: 180, cy: 296, rx: 6, ry: 4 }]} />
      ) : null}
    </Svg>
  );
}
```

### Renderer contract

Every renderer must support:

- `currentWaterings >= 0`;
- `targetWaterings > 0`;
- `witherCount >= 0`;
- `healthy`, `withered`, and `completed` statuses;
- `flawless`, `steady`, and `scarred` completed variants;
- a configurable square `size`;
- the shared `0 0 400 400` view box;
- an accessibility label containing the plant name and growth percentage.

Use `getGrowthState(props)` as the canonical interpretation of progress and setbacks. Do not reproduce its calculations inside a renderer.

### Required visual states

Review at least these cases:

| State               | Props                                                  |
| ------------------- | ------------------------------------------------------ |
| Seedling            | `currentWaterings: 0`, `targetWaterings: 100`, healthy |
| Early growth        | `25 / 100`, healthy                                    |
| Mid growth          | `50 / 100`, healthy                                    |
| Mature              | `90 / 100`, healthy                                    |
| Withered            | `50 / 100`, withered                                   |
| Flawless completion | `100 / 100`, completed, `witherCount: 0`               |
| Steady completion   | `100 / 100`, completed, `witherCount: 2`               |
| Scarred completion  | `100 / 100`, completed, `witherCount: 4+`              |

Withered styling should remain recognizable and legible; it should not simply disappear. Completed variants must preserve the same species identity.

## 7. Register the renderer

Import the component and add the key to `nativePlantRegistry` in:

`apps/mobile/src/features/plants/plantRegistry.tsx`

```tsx
import { MoonOrchidPlant } from "./components/MoonOrchidPlant";

export const nativePlantRegistry: Record<PlantSpecies, ComponentType<PlantProps>> = {
  // Existing plants...
  moon_orchid: MoonOrchidPlant,
};
```

The `Record<PlantSpecies, ...>` contract makes TypeScript fail if the species is not registered.

If title casing the key does not produce the correct product name, add a focused exception to `plantDisplayName` in the same file.

## 8. Decide whether a database migration is required

The current `habits.plant_type` column is `VARCHAR(50)`, not a database enum. Adding a new key normally requires no migration.

A migration is required if you:

- rename an existing persisted key;
- introduce or change a database constraint around plant keys;
- change the column type or length;
- need to backfill existing habits to the new species.

When a migration is required, create it with the Supabase CLI and update TypeScript contracts in the same change.

## 9. Add tests

At minimum, cover:

1. The species belongs to the intended tier.
2. `getTierForSpecies` resolves it correctly.
3. `assignSpecies` can select it deterministically from that tier.
4. New geometry respects its documented invariants.
5. The renderer mounts for healthy, withered, and completed states.
6. The renderer exposes an accurate accessibility label.
7. The registry contains every `PlantSpecies`.

Prefer pure geometry and domain tests over snapshotting a large SVG tree. Use component tests for behavior and accessibility that pure tests cannot prove.

## 10. Review the plant in its real surfaces

Do not approve a plant based only on an isolated SVG.

Check it in:

- Forest `HabitCard`;
- Sanctuary completed card;
- Botanical Laboratory grid;
- habit deep link;
- completion celebration;
- Wrapped highlight, when available;
- narrow mobile and Expo web layouts;
- light and dark themes.

Confirm that:

- no leaves, blooms, particles, or aura are clipped;
- the pot and shadow align with existing plants;
- the watering and reflection controls do not overlap the plant;
- the silhouette remains recognizable at card size;
- text and SVG accessibility remain meaningful;
- animation or particle counts do not cause obvious performance problems.

## 11. Run the completion gates

From the repository root:

```sh
npm run format
npm run format:check
npm test
npm run typecheck
npm run validate:mobile
```

For a production graph check:

```sh
npm exec --workspace apps/mobile expo export -- --platform web --output-dir <temporary-directory>
```

Keep generated export output outside the repository or delete it after verification.

## Pull-request checklist

- [ ] The species key is stable, lowercase `snake_case`, and at most 50 characters.
- [ ] `PlantSpecies` contains the key.
- [ ] `TIER_SPECIES` contains the key exactly once.
- [ ] Existing geometry and shared native pieces were reviewed before adding new ones.
- [ ] Any new geometry is pure, typed, deterministic, and exported intentionally.
- [ ] The renderer accepts `PlantProps` and uses `getGrowthState`.
- [ ] Healthy, withered, completed, flawless, steady, and scarred states work.
- [ ] The SVG uses the shared view box and has an accessibility label.
- [ ] The renderer is registered in `nativePlantRegistry`.
- [ ] The display name is correct.
- [ ] Database migration requirements were assessed.
- [ ] Domain, geometry, renderer, and registry tests are appropriate for the change.
- [ ] Forest, Sanctuary, Lab, deep link, completion, and Wrapped surfaces were reviewed.
- [ ] Formatting, tests, type checks, Expo validation, and export verification pass.

## Definition of done

A plant is complete only when its persisted key, tier assignment, geometry, native renderer, registry entry, visual states, accessibility, tests, and real-surface verification all agree. A renderer file by itself is not a completed plant addition.
