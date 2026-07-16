import { DropdownField, type DropdownOption } from "./DropdownField";

export type SortOption<Value extends string> = DropdownOption<Value>;

interface Props<Value extends string> {
  value: Value;
  options: ReadonlyArray<SortOption<Value>>;
  label: string;
  onChange(value: Value): void;
}

export function SortDropdown<Value extends string>({
  value,
  options,
  label,
  onChange,
}: Props<Value>): React.JSX.Element {
  return <DropdownField value={value} options={options} label={label} onChange={onChange} />;
}
