import { useMemo, useState } from "react";
import type { Habit } from "@sprout/shared";

export type FriendForestFilter = "all" | "healthy" | "withered";

export function filterFriendForestHabits(
  habits: Habit[],
  query: string,
  filter: FriendForestFilter,
): Habit[] {
  const needle = query.trim().toLowerCase();
  return habits
    .filter((habit) => habit.status !== "completed")
    .filter((habit) => filter === "all" || habit.status === filter)
    .filter(
      (habit) =>
        !needle ||
        habit.name.toLowerCase().includes(needle) ||
        Boolean(habit.description?.toLowerCase().includes(needle)),
    )
    .sort((a, b) => {
      if (filter === "all" && a.status !== b.status) return a.status === "withered" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function useFriendForestFilter(habits: Habit[]) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FriendForestFilter>("all");
  const visibleHabits = useMemo(
    () => filterFriendForestHabits(habits, query, filter),
    [filter, habits, query],
  );
  return { query, setQuery, filter, setFilter, visibleHabits };
}
