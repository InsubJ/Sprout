import { PlantProps, GrowthState, FinalVariant } from "../types/plant";

/**
 * getGrowthState
 *
 * Pure function — no side effects, no React dependency.
 *
 * Preconditions:
 *   - currentWaterings and witherCount should be >= 0 (negative values are
 *     clamped, not thrown, since this runs in a render path and must never
 *     crash the UI on a bad row).
 *   - targetWaterings should be > 0. A value <= 0 is treated as 1 to avoid
 *     division by zero.
 *
 * Postconditions:
 *   - growthPercent is always within [0, 100].
 *   - finalVariant is always one of "flawless" | "steady" | "scarred".
 *   - asymmetry is always within [0, 20].
 */
export function getGrowthState({
  currentWaterings,
  targetWaterings,
  witherCount,
  status,
}: Pick<PlantProps, "currentWaterings" | "targetWaterings" | "witherCount" | "status">): GrowthState {
  const safeCurrent = Math.max(0, currentWaterings);
  const safeTarget = Math.max(1, targetWaterings);
  const safeWithers = Math.max(0, witherCount);

  const growthPercent = Math.max(0, Math.min(100, (safeCurrent / safeTarget) * 100));

  const isWithered = status === "withered";
  const isCompleted = status === "completed";

  const finalVariant: FinalVariant =
    safeWithers <= 1 ? "flawless" : safeWithers <= 3 ? "steady" : "scarred";

  const asymmetry = Math.min(safeWithers * 4, 20);

  return { growthPercent, isWithered, isCompleted, finalVariant, asymmetry };
}
