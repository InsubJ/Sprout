import React from 'react';
import { HabitStatus } from '../../types/habit';
import { PlantSpecies, PlantProps } from '../../types/plant';
import { plantRegistry } from '../plants/plantRegistry';
import BonsaiPlant from '../plants/BonsaiPlant';

export interface PlantRendererProps {
  plantType?: string;
  currentWaterings: number;
  targetWaterings: number;
  witherCount?: number;
  status: HabitStatus;
  size?: number;
}

/**
 * Normalizes a string plantType to a valid PlantSpecies key.
 * Converts to lowercase, replaces spaces/hyphens with underscores.
 * Falls back to 'bonsai' if not matched.
 */
export function normalizePlantSpecies(plantType?: string): PlantSpecies {
  if (!plantType) {
    return 'bonsai';
  }
  const normalized = plantType.trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (normalized in plantRegistry) {
    return normalized as PlantSpecies;
  }
  return 'bonsai';
}

/**
 * PlantRenderer
 *
 * Single responsibility: Map habit/plant properties to the correct SVG component.
 * Validates inputs at the boundary (Preconditions).
 */
export const PlantRenderer: React.FC<PlantRendererProps> = ({
  plantType = 'bonsai',
  currentWaterings,
  targetWaterings,
  witherCount = 0,
  status,
  size = 200,
}) => {
  // Preconditions validation (Design by Contract)
  if (currentWaterings < 0) {
    throw new Error('Current waterings cannot be negative');
  }
  if (targetWaterings <= 0) {
    throw new Error('Target waterings must be greater than 0');
  }
  if (witherCount < 0) {
    throw new Error('Wither count cannot be negative');
  }
  if (!['healthy', 'withered', 'completed'].includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const species = normalizePlantSpecies(plantType);
  const RendererComponent = plantRegistry[species] ?? BonsaiPlant;

  const plantProps: PlantProps = {
    currentWaterings,
    targetWaterings,
    witherCount,
    status,
    size,
  };

  return (
    <div data-testid="plant-renderer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <RendererComponent {...plantProps} />
    </div>
  );
};
