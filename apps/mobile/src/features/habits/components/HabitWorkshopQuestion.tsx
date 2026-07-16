import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "@sprout/design-tokens";
import { useTheme } from "../../../providers/ThemeProvider";

interface Props extends PropsWithChildren {
  title: string;
  helper: string;
}

export function HabitWorkshopQuestion({ title, helper, children }: Props): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.root}>
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>
        <Text style={[styles.helper, { color: theme.muted }]}>{helper}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  heading: { gap: spacing.sm },
  title: { fontSize: 28, lineHeight: 35, fontFamily: "Outfit_700Bold" },
  helper: { fontSize: 15, lineHeight: 22, fontFamily: "Outfit_400Regular" },
});
