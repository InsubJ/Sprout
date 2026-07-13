import { StyleSheet, Text, View } from "react-native";
import { radii, spacing } from "@sprout/design-tokens";
import { AppSwitch } from "./AppSwitch";
import { useTheme } from "../providers/ThemeProvider";

interface PreferenceSwitchRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function PreferenceSwitchRow({
  label,
  description,
  value,
  onChange,
}: PreferenceSwitchRowProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.text }]}>{label}</Text>
        {description ? (
          <Text style={[styles.description, { color: theme.muted }]}>{description}</Text>
        ) : null}
      </View>
      <AppSwitch accessibilityLabel={label} value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: "row", alignItems: "center", borderRadius: radii.md, padding: spacing.md },
  text: { flex: 1 },
  title: { fontFamily: "Outfit_700Bold" },
  description: { fontSize: 12 },
});
