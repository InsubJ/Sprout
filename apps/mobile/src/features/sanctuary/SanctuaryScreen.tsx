import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import type { Habit } from "@sprout/shared";
import { colors, spacing } from "@sprout/design-tokens";
import { ScreenState } from "../../components/ScreenState";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { GardenCarousel } from "../habits/components/GardenCarousel";
import { ReflectionBookSheet } from "../habits/components/ReflectionBookSheet";
import { readCachedHabits, writeCachedHabits } from "../habits/services/habitCache";
import { SanctuaryPlantCard } from "./SanctuaryPlantCard";

export function SanctuaryScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { habits: habitRepository } = useServices();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selected, setSelected] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setHabits([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const cached = await readCachedHabits(user.id);
    const cachedCompleted = cached.filter((habit) => habit.status === "completed");
    if (cachedCompleted.length) { setHabits(cachedCompleted); setLoading(false); }
    try {
      const fresh = await habitRepository.getByUserId(user.id);
      setHabits(fresh.filter((habit) => habit.status === "completed"));
      await writeCachedHabits(user.id, fresh);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to refresh Sanctuary");
    } finally {
      setLoading(false);
    }
  }, [habitRepository, user]);

  useEffect(() => { void load(); }, [load]);

  return <>
    <ScrollView style={[styles.root, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
    <Text style={[styles.eyebrow, theme.dark && styles.eyebrowDark]}>MEMORY GARDEN</Text>
    <Text style={[styles.title, { color: theme.text }]}>Sanctuary</Text>
    <Text style={[styles.subtitle, { color: theme.muted }]}>Every completed habit leaves a living story.</Text>
    {loading && !habits.length ? <ScreenState message="Opening the Sanctuary…" /> : habits.length ? <GardenCarousel items={habits} accessibilityLabel="Completed plants in your Sanctuary" keyExtractor={(habit) => habit.id} renderCard={(habit, cardWidth) => <SanctuaryPlantCard habit={habit} width={cardWidth} onOpenJournal={() => setSelected(habit)} />} /> : <ScreenState message="Completed plants will bloom here." />}
    {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    </ScrollView>
    <ReflectionBookSheet habit={selected} onClose={() => setSelected(null)} />
  </>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  content: { paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  eyebrow: { color: colors.forest, fontSize: 12, fontFamily: "Outfit_700Bold", letterSpacing: 1.5, marginHorizontal: spacing.lg },
  eyebrowDark: { color: "#9BCB8E" },
  title: { color: colors.ink, fontSize: 32, fontFamily: "Outfit_700Bold", marginHorizontal: spacing.lg },
  subtitle: { color: colors.muted, marginTop: spacing.xs, marginHorizontal: spacing.lg },
  error: { color: colors.danger, textAlign: "center", paddingHorizontal: spacing.lg },
});
