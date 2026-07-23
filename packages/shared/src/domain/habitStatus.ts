import type { Habit, HabitStatus } from "../types/habit";

export function deriveHabitStatus(
  current: number,
  target: number,
  consecutiveMisses: number,
  witherThreshold: number,
): HabitStatus {
  if (
    [current, target, consecutiveMisses, witherThreshold].some(
      (value) => !Number.isInteger(value) || value < 0,
    )
  )
    throw new RangeError("status values must be non-negative integers");
  if (target === 0 || witherThreshold === 0)
    throw new RangeError("target and witherThreshold must be positive");
  if (current >= target) return "completed";
  if (consecutiveMisses >= witherThreshold) return "withered";
  return "healthy";
}

/**
 * Calculates consecutive missed days/intervals and updates a habit's status
 * based on elapsed time since last watering (or creation).
 */
export function calculateHabitWilting(
  habit: Habit,
  lastWateredAt: string | null,
  now: Date = new Date(),
): Habit {
  if (!habit || typeof habit !== "object") throw new TypeError("Habit object is required");
  if (habit.status === "completed") {
    return { ...habit, consecutive_misses: 0 };
  }

  const baselineStr = lastWateredAt ?? habit.created_at;
  const baselineDate = new Date(baselineStr);
  const baselineTime = isNaN(baselineDate.getTime()) ? now.getTime() : baselineDate.getTime();

  // Calculate elapsed calendar days between baseline and now
  const msPerDay = 86_400_000;
  const elapsedDays = Math.max(0, Math.floor((now.getTime() - baselineTime) / msPerDay));

  // If last watered date is yesterday or earlier, each full past day is a missed day.
  const consecutiveMisses = Math.max(0, lastWateredAt ? elapsedDays - 1 : elapsedDays);

  const status = deriveHabitStatus(
    habit.current_waterings,
    habit.target_waterings,
    consecutiveMisses,
    habit.wither_threshold,
  );

  const transitionedToWithered = status === "withered" && habit.status !== "withered";
  const wither_count = transitionedToWithered ? habit.wither_count + 1 : habit.wither_count;

  return {
    ...habit,
    consecutive_misses: consecutiveMisses,
    status,
    wither_count,
  };
}
