import { useEffect, useMemo, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import type { Habit } from "@sprout/shared";

export type ForestFilter = "all" | "watered" | "needs-water";

export function habitNeedsWater(habit: Habit, wateringsToday: number): boolean {
  if (!Number.isInteger(wateringsToday) || wateringsToday < 0)
    throw new Error("Today's watering count must be a non-negative integer");
  return wateringsToday < (habit.frequency === "twice_daily" ? 2 : 1);
}

export interface ForestFilterState {
  query: string;
  setQuery: (query: string) => void;
  filter: ForestFilter;
  setFilter: (filter: ForestFilter) => void;
  visibleHabits: Habit[];
}

export function useForestFilter(
  habits: Habit[],
  wateringsToday: Record<string, number>,
  lastWateredAt: Record<string, string | null>,
): ForestFilterState {
  if (!Array.isArray(habits)) {
    throw new Error("Habits list must be an array");
  }
  if (!wateringsToday || typeof wateringsToday !== "object") {
    throw new Error("Waterings today mapping must be a valid object");
  }
  if (!lastWateredAt || typeof lastWateredAt !== "object") {
    throw new Error("Last watered at mapping must be a valid object");
  }

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ForestFilter>("needs-water");

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status: AppStateStatus) => {
      if (status === "active") {
        setFilter("needs-water");
        setQuery("");
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);
  const visibleHabits = useMemo(
    () =>
      habits
        .filter(
          (habit) =>
            habit.status !== "completed" &&
            (filter === "all" ||
              (filter === "watered"
                ? (wateringsToday[habit.id] ?? 0) > 0
                : habitNeedsWater(habit, wateringsToday[habit.id] ?? 0))) &&
            (habit.name.toLowerCase().includes(query.trim().toLowerCase()) ||
              Boolean(habit.description?.toLowerCase().includes(query.trim().toLowerCase()))),
        )
        .sort((a, b) => {
          if (filter !== "all") return 0;
          const wateringDifference =
            Number(habitNeedsWater(b, wateringsToday[b.id] ?? 0)) -
            Number(habitNeedsWater(a, wateringsToday[a.id] ?? 0));
          if (wateringDifference) return wateringDifference;
          const rank = (status: Habit["status"]): number =>
            status === "withered" ? 0 : status === "healthy" ? 1 : 2;
          const statusDifference = rank(a.status) - rank(b.status);
          if (statusDifference) return statusDifference;
          return (
            (lastWateredAt[a.id] ? new Date(lastWateredAt[a.id]!).getTime() : 0) -
            (lastWateredAt[b.id] ? new Date(lastWateredAt[b.id]!).getTime() : 0)
          );
        }),
    [filter, habits, lastWateredAt, query, wateringsToday],
  );
  return { query, setQuery, filter, setFilter, visibleHabits };
}
