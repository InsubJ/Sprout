import { View, StyleSheet } from "react-native";
import { spacing } from "@sprout/design-tokens";
import { CollectionFilters, type CollectionFilterOption } from "../../components/CollectionFilters";
import { SortDropdown, type SortOption } from "../../components/SortDropdown";
import type { SanctuaryFilter, SanctuarySort } from "./useSanctuaryCatalogueFilter";
import type { SanctuarySortDirection } from "./sanctuaryCatalogueSorting";

const filterOptions: ReadonlyArray<CollectionFilterOption<SanctuaryFilter>> = [
  { value: "all", label: "All" },
  { value: "classic", label: "Classic" },
  { value: "custom", label: "Custom" },
];

function catalogueSortOptions(
  activeSort: SanctuarySort,
  direction: SanctuarySortDirection,
): ReadonlyArray<SortOption<SanctuarySort>> {
  const activeHint = "Select again to reverse this order";
  return [
    {
      value: "rarity",
      label:
        activeSort === "rarity"
          ? `Rarity · ${direction === "descending" ? "High–Low" : "Low–High"} ↕`
          : "Rarity",
      accessibilityHint: activeSort === "rarity" ? activeHint : undefined,
    },
    {
      value: "name",
      label:
        activeSort === "name" ? `Name · ${direction === "ascending" ? "A–Z" : "Z–A"} ↕` : "Name",
      accessibilityHint: activeSort === "name" ? activeHint : undefined,
    },
    {
      value: "added",
      label:
        activeSort === "added"
          ? `Recently added · ${direction === "descending" ? "Newest" : "Oldest"} ↕`
          : "Recently added",
      accessibilityHint: activeSort === "added" ? activeHint : undefined,
    },
  ];
}

interface SanctuaryCatalogueControlsProps {
  query: string;
  onQuery(value: string): void;
  filter: SanctuaryFilter;
  onFilter(value: SanctuaryFilter): void;
  sort: SanctuarySort;
  sortDirection: SanctuarySortDirection;
  onSort(value: SanctuarySort): void;
}

export function SanctuaryCatalogueControls({
  query,
  onQuery,
  filter,
  onFilter,
  sort,
  sortDirection,
  onSort,
}: SanctuaryCatalogueControlsProps): React.JSX.Element {
  return (
    <View style={styles.root}>
      <CollectionFilters
        query={query}
        filter={filter}
        options={filterOptions}
        searchPlaceholder="Search names, descriptions, and prompts"
        onQueryChange={onQuery}
        onFilterChange={onFilter}
      />
      <View style={styles.sort}>
        <SortDropdown
          value={sort}
          options={catalogueSortOptions(sort, sortDirection)}
          label="Sort plants"
          onChange={onSort}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm, marginVertical: spacing.lg },
  sort: { marginHorizontal: spacing.md },
});
