import type { CustomPlant, Habit } from "@sprout/shared";

export type SanctuaryCatalogueItem =
  | { kind: "classic"; habit: Habit }
  | { kind: "custom"; plant: CustomPlant };
export type SanctuarySort = "rarity" | "name" | "added";
export type SanctuarySortDirection = "ascending" | "descending";

export interface SanctuarySortState {
  field: SanctuarySort;
  direction: SanctuarySortDirection;
}

const rarityRank = { custom: 5, mythical: 4, rare: 3, uncommon: 2, common: 1 } as const;

export function defaultSanctuarySortDirection(field: SanctuarySort): SanctuarySortDirection {
  return field === "name" ? "ascending" : "descending";
}

export function nextSanctuarySortState(
  current: SanctuarySortState,
  selectedField: SanctuarySort,
): SanctuarySortState {
  if (selectedField !== current.field)
    return { field: selectedField, direction: defaultSanctuarySortDirection(selectedField) };
  return {
    field: current.field,
    direction: current.direction === "ascending" ? "descending" : "ascending",
  };
}

function itemName(item: SanctuaryCatalogueItem): string {
  return item.kind === "custom" ? item.plant.displayName : item.habit.name;
}

function itemAddedAt(item: SanctuaryCatalogueItem): number {
  const value =
    item.kind === "custom"
      ? item.plant.createdAt
      : (item.habit.completed_at ?? item.habit.created_at);
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function itemRarity(item: SanctuaryCatalogueItem): number {
  return item.kind === "custom" ? rarityRank.custom : rarityRank[item.habit.difficulty_tier];
}

export function compareSanctuaryCatalogueItems(
  left: SanctuaryCatalogueItem,
  right: SanctuaryCatalogueItem,
  state: SanctuarySortState,
): number {
  const comparison =
    state.field === "name"
      ? itemName(left).localeCompare(itemName(right))
      : state.field === "added"
        ? itemAddedAt(left) - itemAddedAt(right)
        : itemRarity(left) - itemRarity(right);
  const directed = state.direction === "ascending" ? comparison : -comparison;
  return directed || itemName(left).localeCompare(itemName(right));
}
