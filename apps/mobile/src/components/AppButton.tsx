import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { useTheme } from "../providers/ThemeProvider";
interface Props extends PressableProps {
  label: string;
  tone?: "forest" | "disco" | "quiet" | "danger";
}
export function AppButton({ label, tone = "forest", disabled, style, ...props }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      {...props}
      style={({ pressed }) => [
        styles.base,
        styles[tone],
        tone === "quiet" && {
          backgroundColor: theme.elevated,
          borderWidth: 1,
          borderColor: theme.border,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === "function" ? style({ pressed }) : style,
      ]}
    >
      <Text
        style={[
          styles.label,
          tone === "quiet" && styles.quietLabel,
          tone === "quiet" && { color: theme.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  forest: { backgroundColor: colors.forest },
  disco: { backgroundColor: colors.purple },
  danger: { backgroundColor: colors.danger },
  quiet: { backgroundColor: colors.leaf },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.42 },
  label: { color: colors.paper, fontFamily: "Outfit_700Bold", fontSize: 16 },
  quietLabel: { color: colors.evergreen },
});
