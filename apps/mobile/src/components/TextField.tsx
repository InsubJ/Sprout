import { forwardRef, useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { useTheme } from "../providers/ThemeProvider";
interface Props extends TextInputProps {
  label: string;
  error?: string;
}
export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, ...props },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={theme.muted}
        {...props}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[
          styles.input,
          { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
          props.multiline && styles.multiline,
          focused && styles.focused,
          error && styles.invalid,
          props.style,
        ]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});
const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  label: { color: colors.ink, fontFamily: "Outfit_600SemiBold" },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
  },
  multiline: {
    minHeight: 88,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  invalid: { borderColor: colors.danger },
  focused: { borderColor: colors.forest, borderWidth: 2 },
  error: { color: colors.danger, fontSize: 12, fontFamily: "Outfit_500Medium" },
});
