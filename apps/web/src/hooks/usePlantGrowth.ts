import { useMemo } from "react";
import { PlantProps, GrowthState } from "../types/plant";
import { getGrowthState } from "../utils/getGrowthState";

/**
 * usePlantGrowth
 *
 * Single responsibility: derive memoized growth state from habit props.
 * Plant components call this instead of computing growth state inline,
 * keeping components focused purely on rendering.
 */
export function usePlantGrowth({
  currentWaterings,
  targetWaterings,
  witherCount,
  status,
}: Pick<PlantProps, "currentWaterings" | "targetWaterings" | "witherCount" | "status">): GrowthState {
  return useMemo(
    () => getGrowthState({ currentWaterings, targetWaterings, witherCount, status }),
    [currentWaterings, targetWaterings, witherCount, status]
  );
}
