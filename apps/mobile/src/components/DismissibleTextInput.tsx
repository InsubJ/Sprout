import { forwardRef, useId } from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useTheme } from "../providers/ThemeProvider";

export const DismissibleTextInput = forwardRef<TextInput, TextInputProps>(
  function DismissibleTextInput({ inputAccessoryViewID, ...props }, ref) {
    const theme = useTheme();
    const generatedId = `sprout_keyboard_${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const accessoryId = Platform.OS === "ios" ? (inputAccessoryViewID ?? generatedId) : undefined;
    const ownsAccessory = Platform.OS === "ios" && !inputAccessoryViewID;

    return (
      <>
        <TextInput ref={ref} {...props} inputAccessoryViewID={accessoryId} />
        {ownsAccessory ? (
          <InputAccessoryView nativeID={generatedId}>
            <View
              style={[
                styles.toolbar,
                { backgroundColor: theme.surface, borderTopColor: theme.border },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Hide keyboard"
                onPress={Keyboard.dismiss}
                style={({ pressed }) => [styles.done, pressed && styles.pressed]}
              >
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
          </InputAccessoryView>
        ) : null}
      </>
    );
  },
);

const styles = StyleSheet.create({
  toolbar: {
    minHeight: 46,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  done: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  doneText: { color: colors.forest, fontFamily: "Outfit_700Bold", fontSize: 16 },
  pressed: { opacity: 0.55 },
});
