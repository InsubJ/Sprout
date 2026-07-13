import { StyleSheet, Text, TextInput } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../../components/AppButton";

export function DonationAmountForm({
  value,
  valid,
  amount,
  onChange,
  onContinue,
}: {
  value: string;
  valid: boolean;
  amount: number;
  onChange: (value: string) => void;
  onContinue: () => void;
}): React.JSX.Element {
  return (
    <>
      <Text style={styles.label}>
        Donate USD $1 or more. Every complete $5 grants one generation credit; the remainder carries
        forward.
      </Text>
      <TextInput
        accessibilityLabel="Donation amount"
        keyboardType="decimal-pad"
        value={value}
        onChangeText={(next) => onChange(next.replace(/[^0-9.]/g, ""))}
        style={styles.input}
      />
      <AppButton
        tone="disco"
        label={valid ? `Donate USD $${amount.toFixed(2)}` : "Enter at least USD $1.00"}
        disabled={!valid}
        onPress={onContinue}
      />
    </>
  );
}
const styles = StyleSheet.create({
  label: { color: "#E9D4FF", fontFamily: "Outfit_600SemiBold" },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#8B5CF6",
    borderRadius: 12,
    backgroundColor: "#170F29",
    color: colors.paper,
    paddingHorizontal: spacing.md,
    fontSize: 18,
  },
});
