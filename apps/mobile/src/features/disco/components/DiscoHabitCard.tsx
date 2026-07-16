import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@sprout/design-tokens";
import { AppButton } from "../../../components/AppButton";
import { useTheme } from "../../../providers/ThemeProvider";
import { PlantGodGenerationFlow } from "../../customPlants/components/PlantGodGenerationFlow";
import { useGenerationEligibility } from "../../customPlants/hooks/useGenerationEligibility";
import { gardenCardGeometry } from "../../habits/components/gardenCardGeometry";
import { WateringButton } from "../../habits/components/WateringButton";
import { useDiscoPlant } from "../hooks/useDiscoPlant";
import { useDiscoWateringFlow } from "../hooks/useDiscoWateringFlow";
import { DiscoPlant } from "./DiscoPlant";
import { DiscoStatusBadge } from "./DiscoStatusBadge";
import { DiscoWateringSheet } from "./DiscoWateringSheet";
import { PlantGod } from "./PlantGod";
import { RewardProgress } from "./RewardProgress";
const labels = { dancing: "Dancing!", smiling: "Happy", withered: "Wilting" } as const;
export function DiscoHabitCard({
  cardWidth = gardenCardGeometry.width,
}: {
  cardWidth?: number;
}): React.JSX.Element {
  const theme = useTheme(),
    { state, lastWateredAt, waterPlant } = useDiscoPlant(),
    eligibility = useGenerationEligibility();
  const flow = useDiscoWateringFlow(waterPlant, eligibility.rewardRecorded),
    [hovered, setHovered] = useState(false),
    [generationCreditLocked, setGenerationCreditLocked] = useState(false),
    plantGodMode = eligibility.plantGodActive;
  const text = plantGodMode
    ? theme.dark
      ? styles.plantGodTextDark
      : styles.plantGodTextLight
    : theme.dark
      ? styles.discoTextDark
      : styles.discoTextLight;
  const muted = plantGodMode
    ? theme.dark
      ? styles.plantGodMutedDark
      : styles.plantGodMutedLight
    : theme.dark
      ? styles.discoMutedDark
      : styles.discoMutedLight;
  return (
    <>
      <View
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        style={[
          styles.card,
          plantGodMode
            ? theme.dark
              ? styles.plantGodCardDark
              : styles.plantGodCardLight
            : theme.dark
              ? styles.discoCardDark
              : styles.discoCardLight,
          hovered && styles.hovered,
          {
            width: cardWidth,
            minHeight: gardenCardGeometry.height,
            padding: gardenCardGeometry.padding,
            gap: 12,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text style={[styles.name, text]}>
              {plantGodMode ? "✨ Plant God" : "🪩 Disco Plant"}
            </Text>
            <View style={styles.badges}>
              <Text
                style={[
                  styles.special,
                  plantGodMode && styles.godBadge,
                  plantGodMode && theme.dark && styles.godBadgeDark,
                ]}
              >
                Special
              </Text>
              <Text
                style={[
                  styles.mythical,
                  plantGodMode && styles.godBadge,
                  plantGodMode && theme.dark && styles.godBadgeDark,
                ]}
              >
                mythical
              </Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <DiscoStatusBadge state={state} dark={theme.dark} plantGod={plantGodMode} />
          </View>
        </View>
        <View
          style={[
            styles.scene,
            plantGodMode
              ? theme.dark
                ? styles.plantGodSceneDark
                : styles.plantGodSceneLight
              : theme.dark
                ? styles.discoSceneDark
                : styles.discoSceneLight,
            { height: gardenCardGeometry.sceneHeight },
          ]}
        >
          {plantGodMode ? (
            <PlantGod size={184} dark={theme.dark} />
          ) : (
            <>
              <DiscoPlant state={state} size={160} dark={theme.dark} />
              <View style={styles.water}>
                <WateringButton theme="disco" onPress={() => flow.setOpen(true)} />
              </View>
            </>
          )}
        </View>
        <View
          style={[
            styles.specimen,
            plantGodMode
              ? theme.dark
                ? styles.plantGodSpecimenDark
                : styles.plantGodSpecimenLight
              : theme.dark
                ? styles.discoSpecimenDark
                : styles.discoSpecimenLight,
          ]}
        >
          <Text style={[styles.muted, muted]}>Plant Specimen:</Text>
          <Text style={[styles.specimenName, text]}>
            {plantGodMode ? "Celestial Creator" : "Disco Ball"}
          </Text>
        </View>
        <Text numberOfLines={2} style={[styles.description, text]}>
          {plantGodMode
            ? "A radiant creator is ready to shape one original plant."
            : "A mythical party plant whose rewards grow into custom plant credits."}
        </Text>
        {plantGodMode ? (
          <View style={styles.actions}>
            <PlantGodGenerationFlow
              onCompleted={eligibility.finishGeneration}
              onCreditLockedChange={setGenerationCreditLocked}
              onFailed={() => void eligibility.finishGeneration()}
            />
            {!generationCreditLocked && eligibility.balance.availableCredits > 0 ? (
              <AppButton
                tone="quiet"
                label={`Bank credit (${eligibility.balance.availableCredits}/5)`}
                onPress={() => void eligibility.bankCredit()}
              />
            ) : null}
          </View>
        ) : (
          <RewardProgress balance={eligibility.balance} donationAmount={flow.donation} />
        )}
        <View style={styles.footer}>
          <Text style={[styles.muted, muted]}>
            {lastWateredAt
              ? `Last watered ${new Date(lastWateredAt).toLocaleDateString()}`
              : "Never watered"}
          </Text>
          <Text style={[styles.footerState, text]}>
            {plantGodMode ? "Awakened" : labels[state]}
          </Text>
        </View>
      </View>
      {!plantGodMode ? (
        <DiscoWateringSheet
          flow={flow}
          bankedCredits={eligibility.balance.availableCredits}
          onUseBankedCredit={() => void eligibility.activatePlantGod()}
        />
      ) : null}
    </>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, shadowRadius: 16, elevation: 4, overflow: "hidden" },
  discoCardDark: {
    backgroundColor: "#241A3D",
    borderColor: "rgba(156,39,176,.3)",
    shadowColor: "#9C27B0",
    shadowOpacity: 0.16,
  },
  discoCardLight: {
    backgroundColor: "#F2E8FA",
    borderColor: "#B894CC",
    shadowColor: "#7C4D9E",
    shadowOpacity: 0.13,
  },
  plantGodCardLight: {
    backgroundColor: "#FFF1A8",
    borderColor: "#D49A00",
    shadowColor: "#D49A00",
    shadowOpacity: 0.3,
  },
  plantGodCardDark: {
    backgroundColor: "#392E12",
    borderColor: "#A97B13",
    shadowColor: "#E1B32D",
    shadowOpacity: 0.28,
  },
  hovered: { transform: [{ translateY: -6 }], shadowOpacity: 0.28, shadowRadius: 20 },
  header: { position: "relative" },
  heading: { width: "100%", gap: 6 },
  name: {
    paddingRight: 94,
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
    lineHeight: 24,
  },
  statusBadge: { position: "absolute", right: 0, top: 0 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  special: {
    flexShrink: 0,
    alignSelf: "flex-start",
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    color: "#6B357D",
    backgroundColor: "rgba(156,39,176,.14)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  mythical: {
    flexShrink: 0,
    alignSelf: "flex-start",
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    color: "#70418C",
    backgroundColor: "rgba(199,125,255,.14)",
    borderWidth: 1,
    borderColor: "rgba(124,77,158,.35)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  godBadge: {
    color: "#5B4300",
    backgroundColor: "rgba(245,211,77,.35)",
    borderColor: "rgba(213,157,0,.5)",
  },
  godBadgeDark: {
    color: "#FFF1A8",
    backgroundColor: "rgba(225,179,45,.16)",
    borderColor: "rgba(225,179,45,.45)",
  },
  scene: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  discoSceneDark: {
    borderStyle: "dashed",
    borderColor: "rgba(156,39,176,.35)",
    backgroundColor: "#1B1230",
  },
  discoSceneLight: { borderStyle: "dashed", borderColor: "#B894CC", backgroundColor: "#FFF9FF" },
  plantGodSceneLight: { borderColor: "#D6A700", backgroundColor: "#FFF8D6" },
  plantGodSceneDark: { borderColor: "#9B761B", backgroundColor: "#1E1A0D" },
  water: { position: "absolute", right: 12, bottom: 12 },
  specimen: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  discoSpecimenDark: {
    borderColor: "rgba(255,255,255,.08)",
    backgroundColor: "rgba(15,23,42,.45)",
  },
  discoSpecimenLight: { borderColor: "#D4BFDF", backgroundColor: "rgba(255,255,255,.6)" },
  plantGodSpecimenLight: {
    backgroundColor: "rgba(255,255,255,.45)",
    borderColor: "rgba(122,82,0,.24)",
  },
  plantGodSpecimenDark: {
    backgroundColor: "rgba(255,225,112,.08)",
    borderColor: "rgba(225,179,45,.3)",
  },
  specimenName: { fontFamily: "Outfit_700Bold", fontSize: 12 },
  description: { lineHeight: 20, minHeight: 40, fontFamily: "Outfit_400Regular" },
  actions: { gap: 8 },
  footer: {
    marginTop: "auto",
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerState: { fontFamily: "Outfit_700Bold" },
  muted: { fontSize: 12, fontFamily: "Outfit_400Regular" },
  discoTextDark: { color: colors.paper },
  discoMutedDark: { color: "#C8BCD8" },
  discoTextLight: { color: "#35223F" },
  discoMutedLight: { color: "#735F7D" },
  plantGodTextLight: { color: "#3E300C" },
  plantGodMutedLight: { color: "#765D1A" },
  plantGodTextDark: { color: "#FFF1A8" },
  plantGodMutedDark: { color: "#D9C679" },
});
