import type { HabitStatus } from '../types/habit';
export function deriveHabitStatus(current: number, target: number, consecutiveMisses: number, witherThreshold: number): HabitStatus {
  if ([current, target, consecutiveMisses, witherThreshold].some(value => !Number.isInteger(value) || value < 0)) throw new RangeError('status values must be non-negative integers');
  if (target === 0 || witherThreshold === 0) throw new RangeError('target and witherThreshold must be positive');
  if (current >= target) return 'completed';
  if (consecutiveMisses >= witherThreshold) return 'withered';
  return 'healthy';
}
