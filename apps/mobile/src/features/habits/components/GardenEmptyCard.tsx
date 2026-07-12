import { StyleSheet, Text, View } from "react-native";
import { spacing } from "@sprout/design-tokens";
import { useTheme } from "../../../providers/ThemeProvider";
import { gardenCardGeometry } from "./gardenCardGeometry";

interface GardenEmptyCardProps {
  width: number;
  title?: string;
  copy?: string;
  icon?: string;
}

export function GardenEmptyCard({ width, title = "No plants here yet", copy = "Try another filter or plant a new seed.", icon = "🌰" }: GardenEmptyCardProps) {
  const theme = useTheme();
  return <View style={[styles.card, { width, backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={styles.icon}>{icon}</Text><Text style={[styles.title, { color: theme.text }]}>{title}</Text><Text style={[styles.copy, { color: theme.muted }]}>{copy}</Text></View>;
}

const styles = StyleSheet.create({
  card: { height: gardenCardGeometry.height, justifyContent: "center", padding: spacing.xl, alignItems: "center", borderWidth: 1, borderStyle: "dashed", borderRadius: 20 },
  icon: { fontSize: 42 },
  title: { fontFamily: "Outfit_700Bold", fontSize: 19, marginTop: spacing.sm, textAlign: "center" },
  copy: { fontFamily: "Outfit_400Regular", marginTop: spacing.xs, textAlign: "center" },
});
