import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Habit } from "@sprout/shared";

function cacheKey(userId: string): string {
  if (!userId.trim()) throw new Error("User ID is required for habit cache access");
  return `sprout_habits_${userId}`;
}

export async function readCachedHabits(userId: string): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(cacheKey(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Habit[];
  } catch {
    return [];
  }
}

export async function writeCachedHabits(userId: string, habits: readonly Habit[]): Promise<void> {
  await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(habits));
}
