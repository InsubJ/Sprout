import type { HabitFrequency } from "../types/habit";
const limits: Record<HabitFrequency, number> = {
  twice_daily: 2,
  daily: 1,
  weekly: 1,
  fortnightly: 1,
  monthly: 1,
  yearly: 1,
  flexible: 1,
};
export interface WateringAvailability {
  limit: number;
  remaining: number;
  isLimitReached: boolean;
}
export function getWateringAvailability(
  frequency: HabitFrequency,
  wateringsToday: number,
): WateringAvailability {
  if (!Number.isInteger(wateringsToday) || wateringsToday < 0)
    throw new RangeError("wateringsToday must be a non-negative integer");
  const limit = limits[frequency];
  const remaining = Math.max(limit - wateringsToday, 0);
  return { limit, remaining, isLimitReached: remaining === 0 };
}
