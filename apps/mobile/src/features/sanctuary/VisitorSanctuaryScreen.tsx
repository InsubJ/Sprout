import { useState } from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import type { Habit } from "@sprout/shared";
import { ScreenState } from "../../components/ScreenState";
import { useAuth } from "../../providers/AuthProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { GardenCarousel } from "../habits/components/GardenCarousel";
import { ReflectionBookSheet } from "../habits/components/ReflectionBookSheet";
import { FriendGardenHeader } from "../social/FriendGardenHeader";
import { useFriendGarden } from "../social/useFriendGarden";
import { SanctuaryPlantCard } from "./SanctuaryPlantCard";

export function VisitorSanctuaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const { profile, habits: publicHabits, error } = useFriendGarden(id);
  const habits = publicHabits.filter((item) => item.status === "completed");
  const [selected, setSelected] = useState<Habit | null>(null);

  const visibleHabit = (habit: Habit): Habit => {
    const viewerId = user?.id ?? "";
    return {
      ...habit,
      name:
        habit.hide_name && !habit.share_name_friends?.includes(viewerId)
          ? "Private Plant"
          : habit.name,
      description:
        habit.hide_description && !habit.share_desc_friends?.includes(viewerId)
          ? null
          : habit.description,
    };
  };

  if (profile === undefined && !error)
    return <ScreenState message="Opening your bud's Sanctuary…" />;
  if (!profile) return <ScreenState message={error ?? "This Sanctuary is unavailable."} error />;
  return (
    <ScrollView
      disableScrollViewPanResponder={Platform.OS === "web"}
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <FriendGardenHeader
        profile={profile}
        active="sanctuary"
        onLeave={() => router.replace("/(tabs)/buds")}
        onOpenForest={() => router.replace(`/friend-forest/${id}`)}
        onOpenSanctuary={() => undefined}
      />
      {habits.length ? (
        <GardenCarousel
          items={habits}
          accessibilityLabel={`${profile.display_name || profile.username}'s completed plants`}
          keyExtractor={(habit) => habit.id}
          renderCard={(habit, cardWidth) => {
            const visible = visibleHabit(habit);
            return (
              <SanctuaryPlantCard
                habit={visible}
                width={cardWidth}
                onOpenJournal={() => setSelected(visible)}
              />
            );
          }}
        />
      ) : (
        <ScreenState message="No public completed plants are blooming here yet." />
      )}
      <ReflectionBookSheet habit={selected} onClose={() => setSelected(null)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { paddingBottom: 32 } });
