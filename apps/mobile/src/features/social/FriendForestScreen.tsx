import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import type { Habit } from "@sprout/shared";
import { ScreenState } from "../../components/ScreenState";
import { useAuth } from "../../providers/AuthProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { GardenCarousel } from "../habits/components/GardenCarousel";
import { HabitCard } from "../habits/components/HabitCard";
import { ReflectionBookSheet } from "../habits/components/ReflectionBookSheet";
import { FriendGardenHeader } from "./FriendGardenHeader";
import { useFriendGarden } from "./useFriendGarden";
import { useFriendNudges } from "./useFriendNudges";

export function FriendForestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const { profile, habits: publicHabits, error } = useFriendGarden(id);
  const habits = publicHabits.filter((item) => item.status !== "completed");
  const { nudged, nudge } = useFriendNudges(id, Boolean(profile));
  const [reflectionHabit, setReflectionHabit] = useState<Habit | null>(null);

  if (profile === undefined && !error)
    return <ScreenState message="Walking to your bud's forest…" />;
  if (!profile) return <ScreenState message={error ?? "This forest is unavailable."} error />;
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
                    habit.hide_name && !habit.share_name_friends?.includes(user?.id ?? "")
                      ? "Private Plant"
                      : habit.name,
                  description:
                    habit.hide_description && !habit.share_desc_friends?.includes(user?.id ?? "")
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
      <ReflectionBookSheet habit={reflectionHabit} onClose={() => setReflectionHabit(null)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 32 },
});
