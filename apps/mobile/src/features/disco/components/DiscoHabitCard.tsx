import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../../components/AppButton";
import { gardenCardGeometry } from "../../habits/components/gardenCardGeometry";
import { WateringButton } from "../../habits/components/WateringButton";
import { DiscoEnergyBar } from "./DiscoEnergyBar";
import { DiscoPlant } from "./DiscoPlant";
import { DiscoStatusBadge } from "./DiscoStatusBadge";
import { useDiscoPlant } from "../hooks/useDiscoPlant";
const labels = {
  dancing: "Dancing!",
  smiling: "Happy",
  withered: "Wilting",
} as const;
type WateringStep = "choice" | "ad" | "donation" | "thank-you";
export function DiscoHabitCard({ cardWidth = gardenCardGeometry.width }: { cardWidth?: number }) {
  const { state, lastWateredAt, waterPlant } = useDiscoPlant();
  const [modal, setModal] = useState(false);
  const [step, setStep] = useState<WateringStep>("choice");
  const [donationAmount, setDonationAmount] = useState("1.00");
  const [cardHovered, setCardHovered] = useState(false);
  const daysSince = lastWateredAt
    ? Math.min(
        7,
        Math.floor(
          (Date.now() - new Date(lastWateredAt).getTime()) / 86_400_000,
        ),
      )
    : 7;
  const energy = (7 - daysSince) / 7;
  useEffect(() => {
    if (modal) return;
    const timer = setTimeout(() => { setStep("choice"); setDonationAmount("1.00"); }, 250);
    return () => clearTimeout(timer);
  }, [modal]);
  const donation = Number.parseFloat(donationAmount);
  const donationValid = Number.isFinite(donation) && donation >= 1;
  const closeModal = () => setModal(false);
  const completeWatering = async () => { await waterPlant(); setModal(false); };
  return (
    <>
      <View onPointerEnter={() => setCardHovered(true)} onPointerLeave={() => setCardHovered(false)} style={[styles.card, cardHovered && styles.cardHovered, { width: cardWidth, height: gardenCardGeometry.height, padding: gardenCardGeometry.padding, gap: gardenCardGeometry.gap }]}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text style={styles.name}>🪩 Disco Plant</Text>
            <View style={styles.badges}>
              <Text style={styles.special}>Special</Text>
              <Text style={styles.mythical}>mythical</Text>
            </View>
          </View>
          <DiscoStatusBadge state={state} />
        </View>
        <View
          style={[styles.scene, { height: gardenCardGeometry.sceneHeight }]}
        >
          <DiscoPlant state={state} size={160} />
          <View style={styles.water}>
            <WateringButton theme="disco" onPress={() => setModal(true)} />
          </View>
        </View>
        <View style={styles.specimen}>
          <Text style={styles.muted}>Plant Specimen:</Text>
          <Text style={styles.specimenName}>Disco Ball</Text>
        </View>
        <Text numberOfLines={2} style={styles.description}>
          A mythical party plant whose energy stays bright for seven days.
        </Text>
        <View style={styles.energySummary}>
          <Text style={styles.energyLabel}>Disco Energy</Text>
          <Text style={styles.energyValue}>{Math.round(energy * 100)}%</Text>
        </View>
        <View>
          <View style={styles.progressHeader}>
            <Text style={styles.energyLabel}>Seven-day energy</Text>
            <Text style={styles.muted}>{Math.round(energy * 100)}%</Text>
          </View>
          <DiscoEnergyBar progress={energy} dancing={state === "dancing"} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.muted}>
            {lastWateredAt
              ? `Last watered ${new Date(lastWateredAt).toLocaleDateString()}`
              : "Never watered"}
          </Text>
          <Text style={styles.footerState}>{labels[state]}</Text>
        </View>
      </View>
      <Modal
        transparent
        visible={modal}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalIcon}>🪩</Text>
            <Text style={styles.modalTitle}>Help the Disco Plant dance</Text>
            <Text style={styles.modalCopy}>
              Its energy stays bright for seven days and dances for the first 24
              hours.
            </Text>
            {step === "choice" ? <><AppButton tone="disco" label="Watch an ad" onPress={() => setStep("ad")} /><AppButton tone="quiet" label="Donate" onPress={() => setStep("donation")} /><AppButton tone="quiet" label="Not now" onPress={closeModal} /></> : null}
            {step === "ad" ? <><Text style={styles.countdown}>Your ad will play here.</Text><AppButton tone="disco" label="I’ve finished watching" onPress={() => setStep("thank-you")} /></> : null}
            {step === "donation" ? <><Text style={styles.fieldLabel}>Donation amount (minimum $1)</Text><TextInput accessibilityLabel="Donation amount" keyboardType="decimal-pad" value={donationAmount} onChangeText={value => setDonationAmount(value.replace(/[^0-9.]/g, ""))} style={styles.amountInput} /><AppButton tone="disco" label={donationValid ? `Donate $${donation.toFixed(2)}` : "Enter at least $1.00"} disabled={!donationValid} onPress={() => setStep("thank-you")} /></> : null}
            {step === "thank-you" ? <><Text style={styles.thankYou}>Thank you for supporting Sprout!</Text><Text style={styles.modalCopy}>Your Disco Plant is ready to dance.</Text><AppButton tone="disco" label="Water now" onPress={() => void completeWatering()} /></> : null}
          </View>
        </View>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#241A3D",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(156,39,176,.3)",
    shadowColor: "#9C27B0",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
    overflow: "hidden",
  },
  cardHovered: { transform: [{ translateY: -6 }], shadowOpacity: 0.28, shadowRadius: 20 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  heading: { flex: 1, gap: 6 },
  name: {
    color: colors.paper,
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
    lineHeight: 24,
  },
  badges: { flexDirection: "row", gap: 8 },
  special: {
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    color: "#D8A7E6",
    backgroundColor: "rgba(156,39,176,.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  mythical: {
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    color: "#E5C7FF",
    backgroundColor: "rgba(199,125,255,.2)",
    borderWidth: 1,
    borderColor: "rgba(199,125,255,.4)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  scene: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(156,39,176,.35)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#1B1230",
  },
  water: { position: "absolute", right: 12, bottom: 12 },
  specimen: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.08)",
    backgroundColor: "rgba(15,23,42,.45)",
  },
  specimenName: {
    color: colors.paper,
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
  },
  description: {
    color: "#C8BCD8",
    lineHeight: 20,
    minHeight: 40,
    fontFamily: "Outfit_400Regular",
  },
  energySummary: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  energyLabel: {
    color: colors.paper,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 13,
  },
  energyValue: { color: "#C77DFF", fontFamily: "Outfit_700Bold" },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  footer: {
    marginTop: "auto",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerState: { color: "#E9D4FF", fontFamily: "Outfit_700Bold" },
  muted: { color: "#C8BCD8", fontSize: 12, fontFamily: "Outfit_400Regular" },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.65)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: "#241A3D",
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  modalIcon: { fontSize: 64, textAlign: "center" },
  modalTitle: {
    color: colors.paper,
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
  },
  modalCopy: {
    color: "#C8BCD8",
    textAlign: "center",
    fontFamily: "Outfit_400Regular",
  },
  countdown: { color: colors.paper, textAlign: "center", fontFamily: "Outfit_700Bold", fontSize: 18 },
  fieldLabel: { color: "#E9D4FF", fontFamily: "Outfit_600SemiBold" },
  amountInput: { minHeight: 48, borderWidth: 1, borderColor: "#8B5CF6", borderRadius: 12, backgroundColor: "#170F29", color: colors.paper, paddingHorizontal: spacing.md, fontSize: 18 },
  thankYou: { color: colors.paper, fontFamily: "Outfit_700Bold", fontSize: 22, textAlign: "center" },
});
