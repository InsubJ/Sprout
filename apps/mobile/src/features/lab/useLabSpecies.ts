import { useEffect, useMemo, useState } from "react";
import { getTierForSpecies, type Habit, type PlantSpecies } from "@sprout/shared";
import { nativePlantRegistry, plantDisplayName } from "../plants/plantRegistry";
import type { LabSortOption } from "./LabSortDropdown";

export function useLabSpecies(
  habits: Habit[],
  search: string,
  sort: LabSortOption,
  revealAll: boolean,
  pageSize: number,
) {
  const [page, setPage] = useState(1);
  const completed = useMemo(
    () =>
      new Set(
        habits.filter((habit) => habit.status === "completed").map((habit) => habit.plant_type),
      ),
    [habits],
  );
  const dates = useMemo(
    () =>
      habits.reduce<Record<string, number>>((result, habit) => {
        if (habit.status === "completed")
          result[habit.plant_type] = Math.max(
            result[habit.plant_type] ?? 0,
            new Date(habit.completed_at ?? habit.created_at).getTime(),
          );
        return result;
      }, {}),
    [habits],
  );
  const species = useMemo(
    () =>
      (Object.keys(nativePlantRegistry) as PlantSpecies[])
        .filter((item) => {
          const query = search.trim().toLowerCase();
          return (
            plantDisplayName(item).toLowerCase().includes(query) ||
            getTierForSpecies(item).includes(query)
          );
        })
        .sort((a, b) => {
          const unlockedA = revealAll || completed.has(a);
          const unlockedB = revealAll || completed.has(b);
          if (unlockedA !== unlockedB) return unlockedA ? -1 : 1;
          if (sort === "rarity") {
            const rank = { mythical: 0, rare: 1, uncommon: 2, common: 3 };
            return (
              rank[getTierForSpecies(a)] - rank[getTierForSpecies(b)] ||
              plantDisplayName(a).localeCompare(plantDisplayName(b))
            );
          }
          if (sort === "newest")
            return (
              (dates[b] ?? 0) - (dates[a] ?? 0) ||
              plantDisplayName(a).localeCompare(plantDisplayName(b))
            );
          return plantDisplayName(a).localeCompare(plantDisplayName(b));
        }),
    [completed, dates, revealAll, search, sort],
  );
  const totalPages = Math.max(1, Math.ceil(species.length / pageSize));
  useEffect(() => setPage(1), [pageSize, search, sort]);
  useEffect(() => setPage((value) => Math.min(value, totalPages)), [totalPages]);
  return {
    species: species.slice((page - 1) * pageSize, page * pageSize),
    completed,
    page,
    setPage,
    totalPages,
  };
}
