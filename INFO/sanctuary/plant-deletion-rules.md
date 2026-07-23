# Sanctuary Plant Deletion Safety Rules

## Overview

Removing a plant from the Sanctuary is a destructive action requiring explicit confirmation and precondition contract enforcement.

## Precondition Contracts

`useSanctuaryPlantDeletion`:
1. `habit.id` must be defined.
2. `habit.status === "completed"` (Active growing habits in the forest cannot be deleted through this path).
3. If preconditions fail, throws an error.

## Key Source Files

- [apps/mobile/src/features/sanctuary/useSanctuaryPlantDeletion.ts](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/sanctuary/useSanctuaryPlantDeletion.ts): Precondition-enforced hook for deleting sanctuary plants.
- [apps/mobile/src/features/sanctuary/ConfirmPlantDeleteModal.tsx](file:///c:/Users/ijeon/Documents/Sprout/apps/mobile/src/features/sanctuary/ConfirmPlantDeleteModal.tsx): Confirmation modal dialog.
