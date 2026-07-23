# Custom Plant Data Schema & Procedural Renderer

## Overview

Custom plant specifications define the visual parameters needed to dynamically render an AI-generated plant in SVG.

## Custom Plant Spec Fields

- `id`: Unique custom plant UUID.
- `name`: User-given custom plant name.
- `creator_id`: User ID of creator.
- `spec`:
  - `stem`: `{ color, colorDark, strokeWidth, curvature }`
  - `base`: `{ potStyle: "classic" | "rounded" | "none" | "floating_island" | "terrarium_jar" | "crystal_base", groundShadow: boolean }`
  - `layers`: Array of `GeneratedPlantLayer` objects supporting:
    - `type`: Geometry family (including `"custom_path"`)
    - `pathData`: Relative SVG path string for custom organic shapes
    - `gradient`: Multi-stop color gradient (`"linear"` | `"radial"`, `stops`, `angle`)
    - `particles`: Atmospheric particle cluster (`"spores"` | `"sparkles"` | `"fireflies"` | `"petals"` | `"runes"`, `count`, `color`, `spreadRadius`)
    - `stroke`, `strokeWidth`, `scale`, `rotation`, `zIndex`
  - `stateVariants`: `{ healthy, withered, completed }`

## Rendering Adapter

Custom plant specs are rendered via `packages/shared/src/utils/plantGeometry/generatedPlantGeometry.ts`, which interprets the `spec` object and outputs native `react-native-svg` elements.

## Key Source Files

- [packages/shared/src/types/customPlant.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/types/customPlant.ts): Custom plant spec TypeScript definitions.
- [packages/shared/src/schemas/customPlantSchema.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/schemas/customPlantSchema.ts): Zod schema for validating custom plant specifications.
- [packages/shared/src/utils/plantGeometry/generatedPlantGeometry.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/utils/plantGeometry/generatedPlantGeometry.ts): SVG path generator for custom plants.
