import { View, StyleSheet } from "react-native";
import { spacing } from "@sprout/design-tokens";
import { CollectionFilters, type CollectionFilterOption } from "../../components/CollectionFilters";
import { SortDropdown, type SortOption } from "../../components/SortDropdown";
import type { SanctuaryFilter, SanctuarySort } from "./useSanctuaryCatalogue";
const filterOptions: ReadonlyArray<CollectionFilterOption<SanctuaryFilter>> = [
  { value: "all", label: "All" },
  { value: "classic", label: "Classic" },
  { value: "custom", label: "Custom" },
];
const sortOptions: ReadonlyArray<SortOption<SanctuarySort>> = [
  { value: "rarity", label: "Rarity (Custom to Common)" },
  { value: "az", label: "A–Z Name" },
  { value: "za", label: "Z–A Name" },
];
export function SanctuaryCatalogueControls({
  query,
  onQuery,
  filter,
  onFilter,
  sort,
  onSort,
}: {
  query: string;
  onQuery(value: string): void;
  filter: SanctuaryFilter;
  onFilter(value: SanctuaryFilter): void;
  sort: SanctuarySort;
  onSort(value: SanctuarySort): void;
}): React.JSX.Element {
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
        <SortDropdown value={sort} options={sortOptions} label="Sort plants" onChange={onSort} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { gap: spacing.sm, marginVertical: spacing.lg },
  sort: { marginHorizontal: spacing.lg },
});
