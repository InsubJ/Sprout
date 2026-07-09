import React from "react";
import { PlantProps, PlantSpecies } from "../../types/plant";
import { plantRegistry } from "./plantRegistry";
import BonsaiPlant from "./BonsaiPlant";

interface PlantWrapperProps extends PlantProps {
  species: PlantSpecies;
}

/**
 * Plant
 *
 * Looks up the right renderer from plantRegistry. This function never
 * needs to change when a new species is added — see plantRegistry.ts.
 *
 *   <Plant
 *     species={habit.plant_type}
 *     currentWaterings={habit.current_waterings}
 *     targetWaterings={habit.target_waterings}
 *     witherCount={habit.wither_count}
 *     status={habit.status}
 *   />
 */
export default function Plant({ species, ...props }: PlantWrapperProps) {
  const Renderer = plantRegistry[species] ?? BonsaiPlant;
  return <Renderer {...props} />;
}
