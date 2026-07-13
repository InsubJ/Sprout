import { Modal, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../../components/AppButton";
import type { ReturnTypeOfDiscoFlow } from "../types/discoFlow";
import { DonationAmountForm } from "./DonationAmountForm";

export function DiscoWateringSheet({
  flow,
  bankedCredits,
  onUseBankedCredit,
}: {
  flow: ReturnTypeOfDiscoFlow;
  bankedCredits: number;
  onUseBankedCredit(): void;
}): React.JSX.Element {
  return (
    <Modal
      transparent
      visible={flow.open}
      animationType="fade"
      onRequestClose={() => flow.setOpen(false)}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.icon}>🪩</Text>
          <Text style={styles.title}>Help the Disco Plant dance</Text>
          <Text style={styles.copy}>
            Its energy stays bright for seven days and dances for the first 24 hours.
          </Text>
          {flow.step === "choice" ? (
            <>
              <AppButton tone="disco" label="Watch an ad" onPress={() => flow.setStep("ad")} />
              <AppButton tone="quiet" label="Donate" onPress={() => flow.setStep("donation")} />
              {bankedCredits > 0 ? (
                <AppButton
                  tone="disco"
                  label={`Create plant with banked credit (${bankedCredits})`}
                  onPress={() => {
                    flow.setOpen(false);
                    onUseBankedCredit();
                  }}
                />
              ) : null}
              <AppButton tone="quiet" label="Not now" onPress={() => flow.setOpen(false)} />
            </>
          ) : null}
          {flow.step === "ad" ? (
            <>
              <Text style={styles.notice}>Your ad will play here.</Text>
              <AppButton
                tone="disco"
                label={flow.busy ? "Recording reward…" : "I’ve finished watching"}
                disabled={flow.busy}
                onPress={() => void flow.completeAd()}
              />
            </>
          ) : null}
          {flow.step === "donation" ? (
            <>
              <DonationAmountForm
                value={flow.donationAmount}
                valid={flow.donationValid}
                amount={flow.donation}
                onChange={flow.setDonationAmount}
                onContinue={() => void flow.completeDonation()}
              />
              <AppButton
                tone="quiet"
                label="Back"
                disabled={flow.busy}
                onPress={() => flow.setStep("choice")}
              />
              <AppButton
                tone="quiet"
                label="Close"
                disabled={flow.busy}
                onPress={() => flow.setOpen(false)}
              />
            </>
          ) : null}
          {flow.error ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {flow.error}
            </Text>
          ) : null}
          {flow.step === "thank-you" ? (
            <>
              <Text style={styles.thanks}>Thank you for supporting Sprout!</Text>
              <Text style={styles.copy}>Your Disco Plant is ready to dance.</Text>
              <AppButton
                tone="disco"
                label={flow.busy ? "Watering…" : "Water now"}
                disabled={flow.busy}
                onPress={() => void flow.complete()}
              />
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.65)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: "#241A3D",
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  icon: { fontSize: 64, textAlign: "center" },
  title: { color: colors.paper, fontSize: 24, fontFamily: "Outfit_700Bold", textAlign: "center" },
  copy: { color: "#C8BCD8", textAlign: "center", fontFamily: "Outfit_400Regular" },
  notice: { color: colors.paper, textAlign: "center", fontFamily: "Outfit_700Bold", fontSize: 18 },
  thanks: { color: colors.paper, fontFamily: "Outfit_700Bold", fontSize: 22, textAlign: "center" },
  error: { color: "#FFB4AB", textAlign: "center", fontFamily: "Outfit_600SemiBold" },
});
