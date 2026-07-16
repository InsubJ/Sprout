import { useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityActionEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { TrashCanIcon } from "./TrashCanIcon";

interface Props {
  children: ReactNode;
  plantName: string;
  style: StyleProp<ViewStyle>;
  onRequestDelete(): void;
}

export function HoldToRevealDeleteCard({
  children,
  plantName,
  style,
  onRequestDelete,
}: Props): React.JSX.Element {
  const [revealed, setRevealed] = useState(false);
  const reveal = (): void => setRevealed(true);
  const requestDelete = (): void => {
    setRevealed(false);
    onRequestDelete();
  };
  const handleAccessibilityAction = (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === "activate") reveal();
  };

  return (
    <Pressable
      accessibilityLabel={`${plantName} Sanctuary card`}
      accessibilityHint="Press and hold to show the delete action"
      accessibilityActions={[{ name: "activate", label: "Show delete action" }]}
      delayLongPress={550}
      onLongPress={reveal}
      onAccessibilityAction={handleAccessibilityAction}
      style={style}
    >
      {children}
      {revealed ? (
        <View style={styles.deleteTray}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${plantName} from Sanctuary`}
            onPress={requestDelete}
            style={({ pressed }) => [styles.trashButton, pressed && styles.trashButtonPressed]}
          >
            <TrashCanIcon color={colors.paper} size={25} />
            <Text style={styles.deleteLabel}>Delete plant</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  deleteTray: {
    minHeight: 72,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  trashButton: {
    minWidth: 150,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: 16,
  },
  trashButtonPressed: { backgroundColor: "rgba(255,255,255,0.14)" },
  deleteLabel: { color: colors.paper, fontFamily: "Outfit_700Bold", fontSize: 16 },
});
