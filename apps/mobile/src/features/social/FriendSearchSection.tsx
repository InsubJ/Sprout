import { StyleSheet, View } from "react-native";
import type { Profile } from "@sprout/shared";
import { spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { TextField } from "../../components/TextField";
import { BudIdentity } from "./BudIdentity";

export function FriendSearchSection({
  query,
  results,
  onQueryChange,
  onSearch,
  onAdd,
}: {
  query: string;
  results: Profile[];
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onAdd: (profile: Profile) => void;
}): React.JSX.Element {
  return (
    <>
      <View style={styles.search}>
        <TextField
          label="Find by username"
          value={query}
          onChangeText={onQueryChange}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        <AppButton label="Search gardeners" onPress={onSearch} />
      </View>
      {results.map((profile) => (
        <BudIdentity
          key={profile.id}
          profile={profile}
          action={<AppButton label="Add bud" tone="quiet" onPress={() => onAdd(profile)} />}
        />
      ))}
    </>
  );
}
const styles = StyleSheet.create({ search: { paddingHorizontal: spacing.lg, gap: spacing.sm } });
