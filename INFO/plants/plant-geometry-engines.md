# Procedural Plant Geometry Engines

## Overview

Plant curves, branches, leaves, petals, and character postures (Remy, Sprig, Jason) are calculated procedurally through pure mathematical geometry functions located in `@sprout/shared`.

## Geometry Engines

- **Tree Trunk & Branches**: Computes organic Bezier paths for Bonsai and Oak trees based on growth ratio and asymmetry factor.
- **Vines & Trailing**: Computes hanging vine curves and leaf nodes for Pothos and String of Pearls.
- **Radial Leaf Geometry**: Computes radial petal arrays for Sunflowers, Dahlias, and Orchids.
- **Remy (Humanoid) Geometry**: Calculates leg/arm positions, smirks, drooping limbs when withered, and posture.
- **Sprig (Dog) Geometry**: Calculates dog leg sagging, ear droop, tail angle, and posture changes based on wilting.
- **Jason Geometry**: Calculates arm angles and limb positions based on status.

## Key Source Files

- [packages/shared/src/utils/plantGeometry/treeGeometry.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/utils/plantGeometry/treeGeometry.ts): Trunk and branch calculations.
- [packages/shared/src/utils/plantGeometry/vineGeometry.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/utils/plantGeometry/vineGeometry.ts): Vine Bezier path calculations.
- [packages/shared/src/utils/plantGeometry/remyGeometry.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/utils/plantGeometry/remyGeometry.ts): Remy humanoid limb & facial math.
- [packages/shared/src/utils/plantGeometry/dogGeometry.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/utils/plantGeometry/dogGeometry.ts): Sprig dog leg, ear, and tail math.
- [packages/shared/src/utils/plantGeometry/jasonGeometry.ts](file:///c:/Users/ijeon/Documents/Sprout/packages/shared/src/utils/plantGeometry/jasonGeometry.ts): Jason arm math.
