import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import type { Habit } from "@sprout/shared";
import { radii, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../../components/AppButton";
import { SafeAreaModalView } from "../../../components/SafeAreaModalView";
import { ScreenState } from "../../../components/ScreenState";
import { useTheme } from "../../../providers/ThemeProvider";
import { ReflectionInteractions } from "../../sanctuary/ReflectionInteractions";
import { plantDisplayName } from "../../plants/plantRegistry";
import { normalizePlantSpecies } from "../../plants/components/PlantRenderer";
import { useHabitLogs } from "../hooks/useHabitLogs";
import { ReflectionImageViewer } from "./ReflectionImageViewer";
export function ReflectionBookSheet({ habit, onClose }: { habit: Habit | null; onClose(): void }) {
  const theme = useTheme();
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const { entries, loading, error, retry } = useHabitLogs(habit?.id);
  const closeBook = (): void => {
    setFullImageUrl(null);
    onClose();
  };
  return (
    <>
      <Modal
        visible={Boolean(habit)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeBook}
      >
        <SafeAreaModalView
          style={[styles.root, { backgroundColor: theme.background }]}
          minimumTopPadding={spacing.xxl}
        >
          <Text style={[styles.eyebrow, { color: theme.muted }]}>REFLECTION BOOK</Text>
          <Text style={[styles.title, { color: theme.text }]}>{habit?.name}</Text>
          <Text style={[styles.species, { color: theme.muted }]}>
            {habit ? plantDisplayName(normalizePlantSpecies(habit.plant_type)) : ""} ·{" "}
            {habit?.difficulty_tier}
          </Text>
          {habit?.description ? (
            <Text style={[styles.description, { color: theme.text }]}>{habit.description}</Text>
          ) : null}
          {habit?.poetic_summary ? (
            <Text style={[styles.poem, { color: theme.muted }]}>{habit.poetic_summary}</Text>
          ) : null}
          {error ? (
            <View style={styles.loadState}>
              <ScreenState message={error} error />
              <AppButton label="Retry reflections" tone="quiet" onPress={retry} />
            </View>
          ) : (
            <View style={styles.entries}>
              <Text
                accessibilityLiveRegion="polite"
                style={[styles.entryCount, { color: theme.muted }]}
              >
                {loading
                  ? "Loading check-ins…"
                  : `${entries.length} check-in${entries.length === 1 ? "" : "s"}`}
              </Text>
              <FlatList
                data={entries}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  loading ? null : <ScreenState message="No watering check-ins yet." />
                }
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.entry,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.entryHeader}>
                      <Text style={styles.watered}>💧 Watered</Text>
                      <Text style={{ color: theme.muted }}>
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </View>
                    {item.image_url ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="View reflection image full screen"
                        onPress={() => setFullImageUrl(item.image_url ?? null)}
                      >
                        <Image source={item.image_url} style={styles.image} contentFit="cover" />
                      </Pressable>
                    ) : null}
                    {item.note ? (
                      <Text style={[styles.note, { color: theme.text }]}>{item.note}</Text>
                    ) : item.image_url ? null : (
                      <Text style={[styles.noNote, { color: theme.muted }]}>
                        No written reflection was captured for this watering.
                      </Text>
                    )}
                    <ReflectionInteractions logId={item.id} />
                  </View>
                )}
                contentContainerStyle={styles.list}
              />
            </View>
          )}
          <AppButton label="Close Reflection Book" onPress={closeBook} />
        </SafeAreaModalView>
      </Modal>
      <ReflectionImageViewer imageUrl={fullImageUrl} onClose={() => setFullImageUrl(null)} />
    </>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  eyebrow: { fontSize: 11, fontFamily: "Outfit_700Bold", letterSpacing: 1.2 },
  title: { fontSize: 30, fontFamily: "Outfit_700Bold" },
  species: { textTransform: "capitalize" },
  description: { lineHeight: 22 },
  poem: { fontStyle: "italic", lineHeight: 22 },
  list: { paddingVertical: spacing.md },
  entries: { flex: 1 },
  entryCount: { fontFamily: "Outfit_600SemiBold", paddingTop: spacing.sm },
  loadState: { flex: 1, justifyContent: "center" },
  entry: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  watered: { color: "#4A90E2", fontFamily: "Outfit_700Bold" },
  image: { width: "100%", height: 210, borderRadius: radii.md },
  note: { fontSize: 16, lineHeight: 24 },
  noNote: { fontSize: 14, lineHeight: 20, fontStyle: "italic" },
});
