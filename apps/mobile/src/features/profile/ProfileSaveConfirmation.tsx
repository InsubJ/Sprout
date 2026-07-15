import { useEffect, useRef } from "react";
import { Animated, Modal, Platform, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useTheme } from "../../providers/ThemeProvider";

interface Props {
  visible: boolean;
  message: string;
  onDismiss(): void;
}

export function ProfileSaveConfirmation({ visible, message, onDismiss }: Props): React.JSX.Element {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!visible) return;
    opacity.setValue(1);
    const animation = Animated.timing(opacity, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: Platform.OS !== "web",
    });
    animation.start(({ finished }) => {
      if (finished) onDismiss();
    });
    return () => animation.stop();
  }, [onDismiss, opacity, visible]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop} accessibilityViewIsModal>
        <Animated.View
          accessibilityRole="alert"
          style={[
            styles.card,
            {
              opacity,
              backgroundColor: theme.surface,
              borderColor: theme.dark ? "#5D7A67" : colors.forest,
            },
          ]}
        >
          <Text style={styles.icon}>✓</Text>
          <Text style={[styles.title, { color: theme.text }]}>Changes saved</Text>
          <Text style={[styles.message, { color: theme.muted }]}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: "rgba(3, 10, 7, 0.24)",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    textAlign: "center",
    textAlignVertical: "center",
    paddingTop: Platform.OS === "web" ? 8 : 0,
    color: colors.paper,
    backgroundColor: colors.forest,
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
  },
  title: { fontSize: 21, fontFamily: "Outfit_700Bold" },
  message: { textAlign: "center", lineHeight: 20 },
});
