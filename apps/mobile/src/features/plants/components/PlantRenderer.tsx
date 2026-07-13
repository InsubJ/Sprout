import type { HabitStatus, PlantProps, PlantSpecies } from "@sprout/shared";
import { nativePlantRegistry } from "../plantRegistry";
export function normalizePlantSpecies(value?: string): PlantSpecies {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_") as PlantSpecies | undefined;
  return normalized && normalized in nativePlantRegistry ? normalized : "bonsai";
}
export function PlantRenderer({
  plantType,
  ...props
}: Omit<PlantProps, "status"> & { plantType?: string; status: HabitStatus }) {
  if (props.currentWaterings < 0 || props.targetWaterings <= 0 || props.witherCount < 0)
    throw new Error("Plant growth values are invalid");
  const species = normalizePlantSpecies(plantType);
  const Renderer = nativePlantRegistry[species];
  return <Renderer {...props} />;
}
