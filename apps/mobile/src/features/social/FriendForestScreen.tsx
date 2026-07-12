import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import type { Habit, Profile } from "@sprout/shared";
import { ScreenState } from "../../components/ScreenState";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { GardenCarousel } from "../habits/components/GardenCarousel";
import { HabitCard } from "../habits/components/HabitCard";
import { ReflectionBookSheet } from "../habits/components/ReflectionBookSheet";
import { FriendGardenHeader } from "./FriendGardenHeader";

function utcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FriendForestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { habits: habitRepository, profiles, social } = useServices();
  const theme = useTheme();
  const [profile, setProfile] = useState<Profile | null>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nudged, setNudged] = useState<string[]>([]);
  const [reflectionHabit, setReflectionHabit] = useState<Habit | null>(null);

  const load = useCallback(async () => {
    if (!id || !user || !profiles || !social) {
      setError("This shared forest is unavailable.");
      setProfile(null);
      return;
    }
    try {
      const friendships = await social.getFriendships(user.id);
      const connected = friendships.some(
        (item) =>
          item.status === "accepted" &&
          ((item.user_id === user.id && item.friend_id === id) ||
            (item.friend_id === user.id && item.user_id === id)),
      );
      if (!connected)
        throw new Error("Only connected buds can visit this forest.");
      const owner = await profiles.getById(id);
      if (!owner) throw new Error("This gardener is unavailable.");
      const [friendHabits, nudgedHabitIds] = await Promise.all([
        habitRepository.getByUserId(id),
        social.getNudgedHabitIds(user.id, id, utcDateKey()),
      ]);
      setProfile(owner);
      setHabits(
        friendHabits.filter(
          (item) => item.status !== "completed" && item.is_public,
        ),
      );
      setNudged(nudgedHabitIds);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to open this forest",
      );
      setProfile(null);
    }
  }, [habitRepository, id, profiles, social, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const nudge = async (habit: Habit) => {
    if (!social || !user || !id || nudged.includes(habit.id)) return;
    setNudged((current) =>
      current.includes(habit.id) ? current : [...current, habit.id],
    );
    try {
      await social.sendNudge(user.id, id, habit.id);
    } catch (cause) {
      setNudged((current) => current.filter((habitId) => habitId !== habit.id));
      throw cause;
    }
  };

  if (profile === undefined && !error)
    return <ScreenState message="Walking to your bud's forest…" />;
  if (!profile)
    return (
      <ScreenState message={error ?? "This forest is unavailable."} error />
    );
  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <FriendGardenHeader
        profile={profile}
        active="forest"
        onLeave={() => router.replace("/(tabs)/buds")}
        onOpenForest={() => undefined}
        onOpenSanctuary={() => router.replace(`/friend-sanctuary/${id}`)}
      />
      {habits.length ? (
        <GardenCarousel
          items={habits}
          accessibilityLabel={`${profile.display_name || profile.username}'s active plants`}
          keyExtractor={(habit) => habit.id}
          renderCard={(habit, cardWidth) => (
            <HabitCard
              habit={habit}
              viewerId={user?.id}
              wateringsToday={0}
              watering={false}
              cardWidth={cardWidth}
              onOpenReflections={() =>
                setReflectionHabit({
                  ...habit,
                  name:
                    habit.hide_name &&
                    !habit.share_name_friends?.includes(user?.id ?? "")
                      ? "Private Plant"
                      : habit.name,
                  description:
                    habit.hide_description &&
                    !habit.share_desc_friends?.includes(user?.id ?? "")
                      ? null
                      : habit.description,
                })
              }
              onNudge={
                habit.status === "withered"
                  ? () =>
                      void nudge(habit).catch((cause) =>
                        Alert.alert(
                          "Nudge failed",
                          cause instanceof Error ? cause.message : "Try again",
                        ),
                      )
                  : undefined
              }
              isNudged={nudged.includes(habit.id)}
            />
          )}
        />
      ) : (
        <ScreenState message="This connected forest has no public active plants." />
      )}
      <ReflectionBookSheet
        habit={reflectionHabit}
        onClose={() => setReflectionHabit(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 32 },
});
