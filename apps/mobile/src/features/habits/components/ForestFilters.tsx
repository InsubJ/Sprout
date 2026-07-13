import {
  CollectionFilters,
  type CollectionFilterOption,
} from "../../../components/CollectionFilters";
import type { ForestFilter } from "../hooks/useForestFilter";
const options: ReadonlyArray<CollectionFilterOption<ForestFilter>> = [
  { value: "all", label: "All" },
  { value: "watered", label: "Watered" },
  { value: "needs-water", label: "Needs Water" },
];
export function ForestFilters({
  query,
  filter,
  onQueryChange,
  onFilterChange,
}: {
  query: string;
  filter: ForestFilter;
  onQueryChange(value: string): void;
  onFilterChange(value: ForestFilter): void;
}): React.JSX.Element {
  return (
    <CollectionFilters
      query={query}
      filter={filter}
      options={options}
      searchPlaceholder="Search your forest"
      onQueryChange={onQueryChange}
      onFilterChange={onFilterChange}
    />
  );
}
