import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import type { Habit, Profile } from "@sprout/shared";
import { ScreenState } from "../../components/ScreenState";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { GardenCarousel } from "../habits/components/GardenCarousel";
import { ReflectionBookSheet } from "../habits/components/ReflectionBookSheet";
import { FriendGardenHeader } from "../social/FriendGardenHeader";
import { SanctuaryPlantCard } from "./SanctuaryPlantCard";

export function VisitorSanctuaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { habits: repository, profiles, social } = useServices();
  const theme = useTheme();
  const [profile, setProfile] = useState<Profile | null>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selected, setSelected] = useState<Habit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id || !user || !profiles || !social) { setError("This Sanctuary is unavailable."); setProfile(null); return; }
    try {
      const friendships = await social.getFriendships(user.id);
      const connected = friendships.some((item) => item.status === "accepted" && ((item.user_id === user.id && item.friend_id === id) || (item.friend_id === user.id && item.user_id === id)));
      if (!connected) throw new Error("Only connected buds can visit this Sanctuary.");
      const [owner, friendHabits] = await Promise.all([profiles.getById(id), repository.getByUserId(id)]);
      if (!owner) throw new Error("This gardener is unavailable.");
      setProfile(owner);
      setHabits(friendHabits.filter((item) => item.status === "completed" && item.is_public));
      setError(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to open this Sanctuary"); setProfile(null); }
  }, [id, profiles, repository, social, user]);

  useEffect(() => { void load(); }, [load]);

  const visibleHabit = (habit: Habit): Habit => {
    const viewerId = user?.id ?? "";
    return {
      ...habit,
      name: habit.hide_name && !habit.share_name_friends?.includes(viewerId) ? "Private Plant" : habit.name,
      description: habit.hide_description && !habit.share_desc_friends?.includes(viewerId) ? null : habit.description,
    };
  };

  if (profile === undefined && !error) return <ScreenState message="Opening your bud's Sanctuary…" />;
  if (!profile) return <ScreenState message={error ?? "This Sanctuary is unavailable."} error />;
  return <ScrollView style={[styles.root, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
    <Stack.Screen options={{ headerShown: false }} />
    <FriendGardenHeader profile={profile} active="sanctuary" onLeave={() => router.replace("/(tabs)/buds")} onOpenForest={() => router.replace(`/friend-forest/${id}`)} onOpenSanctuary={() => undefined} />
    {habits.length ? <GardenCarousel items={habits} accessibilityLabel={`${profile.display_name || profile.username}'s completed plants`} keyExtractor={(habit) => habit.id} renderCard={(habit, cardWidth) => { const visible = visibleHabit(habit); return <SanctuaryPlantCard habit={visible} width={cardWidth} onOpenJournal={() => setSelected(visible)} />; }} /> : <ScreenState message="No public completed plants are blooming here yet." />}
    <ReflectionBookSheet habit={selected} onClose={() => setSelected(null)} />
  </ScrollView>;
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { paddingBottom: 32 } });
