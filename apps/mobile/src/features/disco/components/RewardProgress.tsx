import { StyleSheet, Text, View } from "react-native";
import type { GenerationCreditBalance } from "@sprout/shared";
import { ProgressBar } from "../../../components/ProgressBar";
import { useTheme } from "../../../providers/ThemeProvider";
export function RewardProgress({
  balance,
  donationAmount,
}: {
  balance: GenerationCreditBalance;
  donationAmount: number;
}): React.JSX.Element {
  const theme = useTheme();
  const entered = Number.isFinite(donationAmount) ? Math.max(0, donationAmount) : 0;
  const amount = Math.min(5, (balance.donationRemainderUsdCents ?? 0) / 100 + entered);
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.dark ? "#E9D4FF" : "#4E365B" }]}>
          Ad rewards
        </Text>
        <Text style={[styles.value, { color: theme.dark ? "#F5DF8C" : "#6C3D85" }]}>
          {balance.verifiedAdsTowardNextCredit}/20
        </Text>
      </View>
      <ProgressBar
        progress={balance.verifiedAdsTowardNextCredit / 20}
        tone="disco"
        trackColor="rgba(199,125,255,.2)"
      />
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.dark ? "#E9D4FF" : "#4E365B" }]}>
          Donation reward
        </Text>
        <Text style={[styles.value, { color: theme.dark ? "#F5DF8C" : "#6C3D85" }]}>
          ${amount.toFixed(2)} / $5.00
        </Text>
      </View>
      <ProgressBar progress={amount / 5} tone="disco" trackColor="rgba(199,125,255,.2)" />
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.dark ? "#E9D4FF" : "#4E365B" }]}>
          Banked credits
        </Text>
        <Text style={[styles.value, { color: theme.dark ? "#F5DF8C" : "#6C3D85" }]}>
          {balance.availableCredits}/5
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: "#E9D4FF", fontFamily: "Outfit_600SemiBold", fontSize: 12 },
  value: { color: "#F5DF8C", fontFamily: "Outfit_700Bold", fontSize: 12 },
});
