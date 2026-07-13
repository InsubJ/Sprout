import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import type { CustomPlant } from "@sprout/shared";
import { AppButton } from "../../components/AppButton";
import { ModalSheet } from "../../components/ModalSheet";
import { useTheme } from "../../providers/ThemeProvider";
import { GeneratedPlantRenderer } from "../customPlants/components/GeneratedPlantRenderer";

export function CustomPlantDetailsSheet({
  plant,
  visible,
  onClose,
  onRequestDelete,
}: {
  plant: CustomPlant;
  visible: boolean;
  onClose(): void;
  onRequestDelete(): void;
}): React.JSX.Element {
  const theme = useTheme();
  const metadata = plant.plantSpec.generationMetadata;
  return (
    <ModalSheet visible={visible} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text style={[styles.eyebrow, theme.dark && styles.eyebrowDark]}>CUSTOM PLANT</Text>
            <Text style={[styles.title, { color: theme.text }]}>{plant.displayName}</Text>
          </View>
          <Text style={styles.badge}>custom</Text>
        </View>

        <View
          style={[styles.scene, { backgroundColor: theme.elevated, borderColor: theme.border }]}
        >
          <GeneratedPlantRenderer spec={plant.plantSpec} size={280} state="completed" />
        </View>

        <DetailSection title="Description" themeText={theme.text}>
          <Text style={[styles.body, { color: theme.text }]}>{plant.description}</Text>
        </DetailSection>

        <DetailSection title="Original inspiration" themeText={theme.text}>
          <Text style={[styles.quote, { color: theme.muted }]}>“{plant.originalPrompt}”</Text>
        </DetailSection>

        <DetailSection title="Plant details" themeText={theme.text}>
          <DetailRow label="Created" value={new Date(plant.createdAt).toLocaleString()} />
          <DetailRow
            label="Visibility"
            value={plant.visibility === "friends" ? "Buds" : "Private"}
          />
          <DetailRow label="Pot" value={plant.plantSpec.base.potStyle} />
          <DetailRow label="Layers" value={String(plant.plantSpec.layers.length)} />
          <DetailRow
            label="Idle motion"
            value={plant.plantSpec.animation.idle.replaceAll("_", " ")}
          />
        </DetailSection>

        <DetailSection title="Palette" themeText={theme.text}>
          <View style={styles.palette}>
            {Object.entries(plant.plantSpec.palette).map(([name, value]) => (
              <View key={name} style={styles.colour}>
                <View
                  style={[styles.swatch, { backgroundColor: value, borderColor: theme.border }]}
                />
                <Text numberOfLines={1} style={[styles.colourName, { color: theme.muted }]}>
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </DetailSection>

        {metadata.reusedGeometryFamilies.length ? (
          <DetailSection title="Botanical forms" themeText={theme.text}>
            <Text style={[styles.body, { color: theme.muted }]}>
              {metadata.reusedGeometryFamilies.join(" · ")}
            </Text>
          </DetailSection>
        ) : null}

        <View style={styles.actions}>
          <AppButton label="Close details" onPress={onClose} />
          <AppButton label="Delete from Sanctuary" tone="danger" onPress={onRequestDelete} />
        </View>
      </ScrollView>
    </ModalSheet>
  );
}

function DetailSection({
  title,
  themeText,
  children,
}: {
  title: string;
  themeText: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: themeText }]}>{title}</Text>
      {children}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <Text style={[styles.rowLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl, gap: spacing.lg },
  header: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  heading: { flex: 1 },
  eyebrow: { color: colors.purple, fontFamily: "Outfit_700Bold", letterSpacing: 1.4 },
  eyebrowDark: { color: "#D7B4F0" },
  title: { fontFamily: "Outfit_700Bold", fontSize: 30, marginTop: spacing.xs },
  badge: {
    color: colors.paper,
    backgroundColor: colors.purple,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontFamily: "Outfit_700Bold",
    overflow: "hidden",
  },
  scene: {
    minHeight: 300,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { gap: spacing.sm },
  sectionTitle: { fontFamily: "Outfit_700Bold", fontSize: 18 },
  body: { lineHeight: 23 },
  quote: { fontStyle: "italic", lineHeight: 22 },
  row: {
    minHeight: 38,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  rowLabel: { fontFamily: "Outfit_500Medium" },
  rowValue: { flex: 1, textAlign: "right", textTransform: "capitalize" },
  palette: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  colour: { width: 64, alignItems: "center", gap: spacing.xs },
  swatch: { width: 42, height: 42, borderRadius: 21, borderWidth: 1 },
  colourName: { width: "100%", textAlign: "center", fontSize: 11 },
  actions: { gap: spacing.md },
});
