import { StyleSheet, Text, View } from "react-native";
import type { Friendship } from "@sprout/shared";
import { radii, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { useTheme } from "../../providers/ThemeProvider";
import { BudIdentity } from "./BudIdentity";
import type { BudRow } from "./useBuds";

export function FriendRequestSection({
  incoming,
  outgoing,
  onRespond,
  onCancel,
  workingRequestId,
}: {
  incoming: BudRow[];
  outgoing: BudRow[];
  onRespond: (friendship: Friendship, status: "accepted" | "declined") => void;
  onCancel: (friendship: Friendship) => void;
  workingRequestId: string | null;
}): React.JSX.Element {
  const theme = useTheme();
  const card = (row: BudRow, incomingRequest: boolean): React.JSX.Element => (
    <View
      key={row.friendship.id}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <BudIdentity profile={row.profile} compact />
      {incomingRequest ? (
        <View style={styles.actions}>
          <AppButton
            label="Accept"
            tone="quiet"
            onPress={() => onRespond(row.friendship, "accepted")}
          />
          <AppButton
            label="Decline"
            tone="quiet"
            onPress={() => onRespond(row.friendship, "declined")}
          />
        </View>
      ) : (
        <View style={styles.outgoingStatus}>
          <Text style={[styles.awaiting, { color: theme.muted }]}>Awaiting response</Text>
          <AppButton
            label={workingRequestId === row.friendship.id ? "Cancelling…" : "Cancel request"}
            tone="quiet"
            disabled={workingRequestId !== null}
            onPress={() => onCancel(row.friendship)}
          />
        </View>
      )}
    </View>
  );
  return (
    <>
      <Text style={[styles.section, { color: theme.text }]}>Friend requests</Text>
      <Text style={[styles.heading, { color: theme.text }]}>Incoming</Text>
      {incoming.length ? (
        incoming.map((row) => card(row, true))
      ) : (
        <Text style={[styles.empty, { color: theme.muted }]}>No incoming requests.</Text>
      )}
      <Text style={[styles.heading, { color: theme.text }]}>Outgoing</Text>
      {outgoing.length ? (
        outgoing.map((row) => card(row, false))
      ) : (
        <Text style={[styles.empty, { color: theme.muted }]}>No outgoing requests.</Text>
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
  heading: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
  },
  empty: { marginHorizontal: spacing.lg, paddingVertical: spacing.sm },
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  actions: { flexDirection: "row", gap: spacing.sm },
  awaiting: { fontSize: 12, fontFamily: "Outfit_500Medium" },
  outgoingStatus: { gap: spacing.sm },
});
