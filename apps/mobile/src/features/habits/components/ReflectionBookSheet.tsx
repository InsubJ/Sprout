import { useEffect, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import type { Habit, HabitLog } from "@sprout/shared";
import { radii, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../../components/AppButton";
import { ScreenState } from "../../../components/ScreenState";
import { useServices } from "../../../providers/ServicesProvider";
import { useTheme } from "../../../providers/ThemeProvider";
import { ReflectionInteractions } from "../../sanctuary/ReflectionInteractions";
import { plantDisplayName } from "../../plants/plantRegistry";
import { normalizePlantSpecies } from "../../plants/components/PlantRenderer";
export function ReflectionBookSheet({
  habit,
  onClose,
}: {
  habit: Habit | null;
  onClose(): void;
}) {
  const { logs } = useServices();
  const theme = useTheme();
  const [entries, setEntries] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    if (!habit) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError(null);
    if (!logs) {
      setEntries([]);
      setLoading(false);
      return;
    }
    let timeout: ReturnType<typeof setTimeout>;
    void Promise.race([
      logs.getByHabitId(habit.id),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () =>
            reject(
              new Error(
                "Reflection entries took too long to load. Please try again.",
              ),
            ),
          10000,
        );
      }),
    ])
      .then((items) =>
        setEntries(
          items
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            ),
        ),
      )
      .catch((cause) =>
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to open reflection book",
        ),
      )
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
    return () => clearTimeout(timeout);
  }, [habit, logs, reloadKey]);
  return (
    <Modal
      visible={Boolean(habit)}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <Text style={[styles.eyebrow, { color: theme.muted }]}>
          REFLECTION BOOK
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>{habit?.name}</Text>
        <Text style={[styles.species, { color: theme.muted }]}>
          {habit
            ? plantDisplayName(normalizePlantSpecies(habit.plant_type))
            : ""}{" "}
          · {habit?.difficulty_tier}
        </Text>
        {habit?.description ? (
          <Text style={[styles.description, { color: theme.text }]}>
            {habit.description}
          </Text>
        ) : null}
        {habit?.poetic_summary ? (
          <Text style={[styles.poem, { color: theme.muted }]}>
            {habit.poetic_summary}
          </Text>
        ) : null}
        {error ? (
          <View style={styles.loadState}>
            <ScreenState message={error} error />
            <AppButton
              label="Retry reflections"
              tone="quiet"
              onPress={() => setReloadKey((value) => value + 1)}
            />
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
              ListEmptyComponent={loading ? null : <ScreenState message="No watering check-ins yet." />}
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
                    <Image
                      source={item.image_url}
                      style={styles.image}
                      contentFit="cover"
                    />
                  ) : null}
                  {item.note ? (
                    <Text style={[styles.note, { color: theme.text }]}> 
                      {item.note}
                    </Text>
                  ) : item.image_url ? null : (
                    <Text style={[styles.noNote, { color: theme.muted }]}>No written reflection was captured for this watering.</Text>
                  )}
                  <ReflectionInteractions logId={item.id} />
                </View>
              )}
              contentContainerStyle={styles.list}
            />
          </View>
        )}
        <AppButton label="Close Reflection Book" onPress={onClose} />
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
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
