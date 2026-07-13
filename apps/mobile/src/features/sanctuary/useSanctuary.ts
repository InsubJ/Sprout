import { useMemo } from "react";
import { useHabitCollection } from "../habits/hooks/useHabitCollection";
import type { Habit } from "@sprout/shared";

export interface SanctuaryState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
export function useSanctuary(): SanctuaryState {
  const collection = useHabitCollection();
  const habits = useMemo(
    () => collection.habits.filter((habit) => habit.status === "completed"),
    [collection.habits],
  );
  return {
    habits,
    loading: collection.loading,
    error: collection.error,
    refresh: collection.refresh,
  };
}
