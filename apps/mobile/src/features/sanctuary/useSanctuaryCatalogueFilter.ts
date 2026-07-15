import { useCallback, useMemo, useState } from "react";
import type { CustomPlant, Habit } from "@sprout/shared";
import {
  compareSanctuaryCatalogueItems,
  nextSanctuarySortState,
  type SanctuaryCatalogueItem,
  type SanctuarySort,
  type SanctuarySortState,
} from "./sanctuaryCatalogueSorting";

export type { SanctuaryCatalogueItem, SanctuarySort } from "./sanctuaryCatalogueSorting";
export type SanctuaryFilter = "all" | "classic" | "custom";

export function useSanctuaryCatalogueFilter(classicHabits: Habit[], customPlants: CustomPlant[]) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SanctuaryFilter>("all");
  const [sortState, setSortState] = useState<SanctuarySortState>({
    field: "rarity",
    direction: "descending",
  });
  const setSort = useCallback((field: SanctuarySort): void => {
    setSortState((current) => nextSanctuarySortState(current, field));
  }, []);
  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [
      ...customPlants.map((plant) => ({ kind: "custom" as const, plant })),
      ...classicHabits.map((habit) => ({ kind: "classic" as const, habit })),
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
      .sort((left, right) =>
        compareSanctuaryCatalogueItems(
          left as SanctuaryCatalogueItem,
          right as SanctuaryCatalogueItem,
          sortState,
        ),
      );
  }, [classicHabits, customPlants, filter, query, sortState]);

  return {
    items,
    hasPlants: classicHabits.length > 0 || customPlants.length > 0,
    query,
    setQuery,
    filter,
    setFilter,
    sort: sortState.field,
    sortDirection: sortState.direction,
    setSort,
  };
}
