import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useTheme } from "../providers/ThemeProvider";
import { SearchField } from "./SearchField";
export interface CollectionFilterOption<Value extends string> {
  value: Value;
  label: string;
}
export function CollectionFilters<Value extends string>({
  query,
  filter,
  options,
  searchPlaceholder,
  onQueryChange,
  onFilterChange,
}: {
  query: string;
  filter: Value;
  options: ReadonlyArray<CollectionFilterOption<Value>>;
  searchPlaceholder?: string;
  onQueryChange(value: string): void;
  onFilterChange(value: Value): void;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <SearchField value={query} onChangeText={onQueryChange} placeholder={searchPlaceholder} />
      <View style={styles.filters}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: filter === option.value }}
            onPress={() => onFilterChange(option.value)}
            style={[
              styles.chip,
              { borderColor: theme.border },
              filter === option.value && styles.selected,
            ]}
          >
            <Text
              style={[
                styles.text,
                { color: theme.muted },
                filter === option.value && styles.selectedText,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: 18,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  chip: {
    flexGrow: 1,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selected: { backgroundColor: colors.forest, borderColor: colors.forest },
  text: { textTransform: "capitalize" },
  selectedText: { color: colors.paper, fontFamily: "Outfit_700Bold" },
});
