import { Alert, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { useImageAcquisition } from "../../hooks/useImageAcquisition";
import { useUserMediaUpload } from "../../hooks/useUserMediaUpload";

export function AvatarEditor({
  avatar,
  userId,
  onChange,
}: {
  avatar: string | null;
  userId?: string;
  onChange: (uri: string | null) => void;
}): React.JSX.Element {
  const acquisition = useImageAcquisition({ allowsEditing: true, aspect: [1, 1], quality: 0.72 });
  const media = useUserMediaUpload();
  const choose = async (source: "camera" | "library"): Promise<void> => {
    const uri = await acquisition.acquire(source);
    if (!uri) return;
    const id = `avatar-${userId ?? "profile"}${source === "camera" ? `-${Date.now()}` : ""}`;
    const result = await media.upload({ uri, fileName: "avatar.jpg", id });
    if (!result.imageUrl) throw new Error("Avatar upload requires a network connection");
    onChange(result.imageUrl);
  };
  const run = (source: "camera" | "library"): void => {
    void choose(source).catch((cause) =>
      Alert.alert(
        source === "camera" ? "Camera failed" : "Image failed",
        cause instanceof Error ? cause.message : "Try again",
      ),
    );
  };
  return (
    <>
      {avatar ? (
        <Image source={avatar} style={styles.avatar} contentFit="cover" />
      ) : (
        <Text style={styles.fallback}>👤</Text>
      )}
      <AppButton label="Choose from photos" tone="quiet" onPress={() => run("library")} />
      <AppButton label="Open camera" tone="quiet" onPress={() => run("camera")} />
      {avatar ? (
        <AppButton label="Remove avatar" tone="quiet" onPress={() => onChange(null)} />
      ) : null}
    </>
  );
}
const styles = StyleSheet.create({
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignSelf: "center",
    backgroundColor: colors.leaf,
  },
  fallback: {
    fontSize: 74,
    textAlign: "center",
    backgroundColor: colors.leaf,
    borderRadius: radii.pill,
    overflow: "hidden",
    alignSelf: "center",
    padding: spacing.md,
  },
});
