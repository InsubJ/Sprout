import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { useImageAcquisition } from "../../hooks/useImageAcquisition";
import { useUserMediaUpload } from "../../hooks/useUserMediaUpload";
import { prepareUploadAsset } from "../../utils/prepareUploadAsset";
import { CameraCaptureModal } from "../../components/CameraCaptureModal";
import { CameraOpenButton } from "../../components/CameraOpenButton";

export function AvatarEditor({
  avatar,
  onChange,
}: {
  avatar: string | null;
  onChange: (uri: string | null) => void;
}): React.JSX.Element {
  const acquisition = useImageAcquisition({ allowsEditing: true, aspect: [1, 1], quality: 0.72 });
  const media = useUserMediaUpload();
  const [uploading, setUploading] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const saveImage = async (uri: string): Promise<void> => {
    if (!uri) return;
    setUploading(true);
    try {
      const prepared = await prepareUploadAsset(uri, `avatar-${media.userId ?? "profile"}`);
      onChange(await media.uploadAvatar(prepared));
      acquisition.clear();
    } catch (cause) {
      acquisition.clear();
      throw cause;
    } finally {
      setUploading(false);
    }
  };
  const chooseFromLibrary = (): void => {
    void acquisition
      .acquire("library")
      .then(async (uri) => {
        if (uri) await saveImage(uri);
      })
      .catch((cause) =>
        Alert.alert("Image failed", cause instanceof Error ? cause.message : "Try again"),
      );
  };
  return (
    <>
      {acquisition.imageUri || avatar ? (
        <Image source={acquisition.imageUri ?? avatar} style={styles.avatar} contentFit="cover" />
      ) : (
        <Text style={styles.fallback}>👤</Text>
      )}
      <AppButton
        label={uploading ? "Updating avatar…" : "Choose from photos"}
        tone="quiet"
        disabled={uploading}
        onPress={chooseFromLibrary}
      />
      <CameraOpenButton
        label="Open camera"
        disabled={uploading}
        onOpenCamera={() => setCameraVisible(true)}
        onCapture={async (uri) => {
          acquisition.setImageUri(uri);
          await saveImage(uri);
        }}
        onError={(error) => Alert.alert("Camera failed", error.message)}
      />
      {avatar ? (
        <AppButton
          label="Remove avatar"
          tone="quiet"
          disabled={uploading}
          onPress={() => {
            acquisition.clear();
            onChange(null);
          }}
        />
      ) : null}
      <CameraCaptureModal
        visible={cameraVisible}
        onCapture={saveImage}
        onClose={() => setCameraVisible(false)}
        onError={(error) => Alert.alert("Camera failed", error.message)}
      />
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
