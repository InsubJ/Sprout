import { SortDropdown, type SortOption } from "../../components/SortDropdown";
export type LabSortOption = "alphabetical" | "rarity" | "newest";
const options: ReadonlyArray<SortOption<LabSortOption>> = [
  { value: "alphabetical", label: "A-Z Name" },
  { value: "rarity", label: "Rarity (Mythical to Common)" },
  { value: "newest", label: "Newest Discovered" },
];
export function LabSortDropdown({
  value,
  onChange,
}: {
  value: LabSortOption;
  onChange(value: LabSortOption): void;
}): React.JSX.Element {
  return <SortDropdown value={value} options={options} label="Sort species" onChange={onChange} />;
}
