export interface HabitProgress { current: number; target: number; ratio: number; percent: number; isComplete: boolean }
export function getHabitProgress(current: number, target: number): HabitProgress {
  if (!Number.isInteger(current) || current < 0) throw new RangeError('current must be a non-negative integer');
  if (!Number.isInteger(target) || target <= 0) throw new RangeError('target must be a positive integer');
  const ratio = Math.min(current / target, 1);
  return { current, target, ratio, percent: Math.round(ratio * 100), isComplete: current >= target };
}
