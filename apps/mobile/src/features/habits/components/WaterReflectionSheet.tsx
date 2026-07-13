import { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { colors, spacing } from "@sprout/design-tokens";
import type { Habit } from "@sprout/shared";
import { AppButton } from "../../../components/AppButton";
import { TextField } from "../../../components/TextField";
import { prepareUploadAsset } from "../../../utils/prepareUploadAsset";
import type { UploadAsset } from "@sprout/services";
import { useTheme } from "../../../providers/ThemeProvider";
import { useImageAcquisition } from "../../../hooks/useImageAcquisition";
import { useUserMediaUpload } from "../../../hooks/useUserMediaUpload";
interface Props {
  habit: Habit | null;
  busy: boolean;
  onClose(): void;
  onConfirm(note?: string, imageUrl?: string, pendingAsset?: UploadAsset): Promise<void>;
}
export function WaterReflectionSheet({ habit, busy, onClose, onConfirm }: Props) {
  const theme = useTheme();
  const [note, setNote] = useState("");
  const { imageUri, setImageUri, acquire, clear } = useImageAcquisition({
    quality: 0.8,
    recoverAndroidResult: Boolean(habit),
  });
  const { userId, upload } = useUserMediaUpload();
  const [submitting, setSubmitting] = useState(false);
  const choose = async (camera: boolean) => {
    await acquire(camera ? "camera" : "library");
  };
  const confirm = async () => {
    if (submitting || busy) return;
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      let pendingAsset: UploadAsset | undefined;
      if (imageUri && userId) {
        const id = `${userId}-${habit?.id ?? "reflection"}-${Date.now()}`;
        const prepared = await prepareUploadAsset(imageUri, id);
        ({ imageUrl, pendingAsset } = await upload(prepared));
      }
      await onConfirm(note.trim() || undefined, imageUrl, pendingAsset);
      setNote("");
      clear();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };
  const working = busy || submitting;
  const close = () => {
    if (working) return;
    setNote("");
    clear();
    onClose();
  };
  return (
    <Modal
      visible={Boolean(habit)}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: theme.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={[styles.title, { color: theme.text }]}>Water {habit?.name}</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Optionally capture what helped today.
        </Text>
        <TextField
          label="Reflection"
          value={note}
          onChangeText={setNote}
          multiline
          maxLength={500}
        />
        {imageUri ? <Image source={imageUri} style={styles.preview} contentFit="cover" /> : null}
        {imageUri ? (
          <AppButton label="Remove photo" tone="quiet" onPress={() => setImageUri(null)} />
        ) : null}
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppButton
              label="Camera"
              tone="quiet"
              onPress={() =>
                void choose(true).catch((cause) =>
                  Alert.alert(
                    "Camera unavailable",
                    cause instanceof Error ? cause.message : "Try again",
                  ),
                )
              }
            />
          </View>
          <View style={styles.flex}>
            <AppButton
              label="Photo"
              tone="quiet"
              onPress={() =>
                void choose(false).catch((cause) =>
                  Alert.alert(
                    "Photos unavailable",
                    cause instanceof Error ? cause.message : "Try again",
                  ),
                )
              }
            />
          </View>
        </View>
        <AppButton
          label={working ? (imageUri ? "Preparing reflection…" : "Watering…") : "Confirm watering"}
          disabled={working}
          onPress={() =>
            void confirm().catch((cause) =>
              Alert.alert("Watering failed", cause instanceof Error ? cause.message : "Try again"),
            )
          }
        />
        <AppButton label="Cancel" tone="quiet" disabled={working} onPress={close} />
      </KeyboardAvoidingView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
  title: { color: colors.ink, fontSize: 28, fontFamily: "Outfit_700Bold" },
  subtitle: { color: colors.muted },
  preview: { width: "100%", height: 200, borderRadius: 16 },
  row: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
});
