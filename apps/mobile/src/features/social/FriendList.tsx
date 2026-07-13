import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { useTheme } from "../../providers/ThemeProvider";
import { BudIdentity } from "./BudIdentity";
import type { BudRow } from "./useBuds";

export function FriendList({
  rows,
  onVisit,
}: {
  rows: BudRow[];
  onVisit: (profileId: string) => void;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <>
      <Text style={[styles.section, { color: theme.text }]}>Connected forests</Text>
      {rows.length ? (
        rows.map((row) => (
          <View key={row.friendship.id} style={[styles.card, { backgroundColor: theme.surface }]}>
            <BudIdentity profile={row.profile} />
            <View style={styles.visit}>
              <AppButton
                label="Visit garden"
                tone="quiet"
                onPress={() => onVisit(row.profile.id)}
              />
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>Your connected gardeners will appear here.</Text>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  section: {
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  empty: { color: colors.muted, textAlign: "center", padding: spacing.xl },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  visit: { padding: spacing.md, paddingTop: 0 },
});
