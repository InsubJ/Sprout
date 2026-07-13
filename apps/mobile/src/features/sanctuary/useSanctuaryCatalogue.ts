import { useMemo, useState } from "react";
import type { CustomPlant, Habit } from "@sprout/shared";
import { useCustomPlants } from "../customPlants/hooks/useCustomPlants";
import { useSanctuary } from "./useSanctuary";
export type SanctuaryCatalogueItem =
  | { kind: "classic"; habit: Habit }
  | { kind: "custom"; plant: CustomPlant };
export type SanctuaryFilter = "all" | "classic" | "custom";
export type SanctuarySort = "rarity" | "az" | "za";
const rank = { custom: 5, mythical: 4, rare: 3, uncommon: 2, common: 1 } as const;
export function useSanctuaryCatalogue() {
  const classic = useSanctuary(),
    custom = useCustomPlants();
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState<SanctuaryFilter>("all"),
    [sort, setSort] = useState<SanctuarySort>("rarity");
  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [
      ...custom.plants.map((plant) => ({ kind: "custom" as const, plant })),
      ...classic.habits.map((habit) => ({ kind: "classic" as const, habit })),
    ]
      .filter((item) => filter === "all" || item.kind === filter)
      .filter((item) => {
        if (!needle) return true;
        return item.kind === "custom"
          ? `${item.plant.displayName} ${item.plant.description} ${item.plant.originalPrompt}`
              .toLowerCase()
              .includes(needle)
          : `${item.habit.name} ${item.habit.description ?? ""}`.toLowerCase().includes(needle);
      })
      .sort((a, b) => {
        const an = a.kind === "custom" ? a.plant.displayName : a.habit.name,
          bn = b.kind === "custom" ? b.plant.displayName : b.habit.name;
        if (sort === "az") return an.localeCompare(bn);
        if (sort === "za") return bn.localeCompare(an);
        const ar = a.kind === "custom" ? rank.custom : rank[a.habit.difficulty_tier],
          br = b.kind === "custom" ? rank.custom : rank[b.habit.difficulty_tier];
        return br - ar || an.localeCompare(bn);
      });
  }, [classic.habits, custom.plants, filter, query, sort]);
  return {
    items,
    query,
    setQuery,
    filter,
    setFilter,
    sort,
    setSort,
    loading: classic.loading || custom.loading,
    error: classic.error ?? custom.error,
    deleteCustomPlant: custom.deletePlant,
  };
}
