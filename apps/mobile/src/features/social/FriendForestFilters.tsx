import { CollectionFilters, type CollectionFilterOption } from "../../components/CollectionFilters";
import type { FriendForestFilter } from "./useFriendForestFilter";

const options: ReadonlyArray<CollectionFilterOption<FriendForestFilter>> = [
  { value: "all", label: "All" },
  { value: "healthy", label: "Healthy" },
  { value: "withered", label: "Withered" },
];

export function FriendForestFilters({
  query,
  filter,
  onQueryChange,
  onFilterChange,
}: {
  query: string;
  filter: FriendForestFilter;
  onQueryChange(value: string): void;
  onFilterChange(value: FriendForestFilter): void;
}): React.JSX.Element {
  return (
    <CollectionFilters
      query={query}
      filter={filter}
      options={options}
      searchPlaceholder="Search this forest"
      onQueryChange={onQueryChange}
      onFilterChange={onFilterChange}
    />
  );
}
