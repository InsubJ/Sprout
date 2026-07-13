import { useMemo, useState } from "react";
import type { Habit } from "@sprout/shared";

export type ForestFilter = "all" | "watered" | "needs-water";

export function useForestFilter(
  habits: Habit[],
  wateringsToday: Record<string, number>,
  lastWateredAt: Record<string, string | null>,
) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ForestFilter>("all");
  const visibleHabits = useMemo(
    () =>
      habits
        .filter(
          (habit) =>
            habit.status !== "completed" &&
            (filter === "all" ||
              (filter === "watered"
                ? (wateringsToday[habit.id] ?? 0) > 0
                : (wateringsToday[habit.id] ?? 0) < (habit.frequency === "twice_daily" ? 2 : 1))) &&
            (habit.name.toLowerCase().includes(query.trim().toLowerCase()) ||
              Boolean(habit.description?.toLowerCase().includes(query.trim().toLowerCase()))),
        )
        .sort((a, b) => {
          if (filter !== "all") return 0;
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
