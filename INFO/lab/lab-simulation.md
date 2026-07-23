# Lab Growth Simulation Controls

## Overview

In the Lab, gardeners can interactively experiment with growth stages and wilting levels for unlocked species.

## Simulation Controls

- **Waterings Slider**: Controls `currentWaterings` from 0 to `targetWaterings` to observe procedural SVG scaling.
- **Wither Count Stepper**: Controls historical `witherCount` (0 to 5) to inspect variant changes (`flawless`, `steady`, `scarred`) and asymmetry.
- **Wither Status Toggle**: Toggles `status === "withered"` to observe withered colors and limp posture changes.

## Key Source Files

- [apps/mobile/src/features/lab/LabSimulationModal.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/lab/LabSimulationModal.tsx): Interactive growth sandbox modal.
- [apps/mobile/src/features/lab/LabSortDropdown.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/lab/LabSortDropdown.tsx): Sort dropdown component for lab grid.
