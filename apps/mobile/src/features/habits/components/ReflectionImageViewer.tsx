import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "@sprout/design-tokens";

interface ReflectionImageViewerProps {
  imageUrl: string | null;
  onClose(): void;
}

export function ReflectionImageViewer({
  imageUrl,
  onClose,
}: ReflectionImageViewerProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      transparent
      visible={Boolean(imageUrl)}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        accessibilityViewIsModal
        style={[
          styles.root,
          { paddingTop: Math.max(insets.top, spacing.md), paddingBottom: insets.bottom },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close full-screen reflection image"
          onPress={onClose}
          style={styles.close}
        >
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
        {imageUrl ? (
          <Image
            accessibilityLabel="Full-size reflection"
            source={imageUrl}
            style={styles.image}
            contentFit="contain"
          />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "rgba(0,0,0,.96)", paddingHorizontal: spacing.md },
  close: {
    alignSelf: "flex-end",
    minWidth: 64,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#FFFFFF", fontFamily: "Outfit_700Bold", fontSize: 16 },
  image: { flex: 1, width: "100%" },
});
