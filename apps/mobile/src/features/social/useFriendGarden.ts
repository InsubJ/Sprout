import { useCallback, useEffect, useState } from "react";
import type { CustomPlant, Habit, Profile } from "@sprout/shared";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";

const friendGardenRealtimeTables = ["friendships", "profiles", "habits", "custom_plants"] as const;

export interface FriendGardenState {
  profile: Profile | null | undefined;
  habits: Habit[];
  customPlants: CustomPlant[];
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFriendGarden(friendId?: string): FriendGardenState {
  const { user } = useAuth();
  const {
    habits: habitRepository,
    profiles,
    social,
    customPlants: customPlantRepository,
  } = useServices();
  const [profile, setProfile] = useState<Profile | null | undefined>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [customPlants, setCustomPlants] = useState<CustomPlant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const refresh = useCallback(async (): Promise<void> => {
    setRequestId((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    if (!friendId || !user || !profiles || !social) {
      setError("This shared garden is unavailable.");
      setProfile(null);
      setHabits([]);
      setCustomPlants([]);
      return () => {
        active = false;
      };
    }
    setProfile(undefined);
    setError(null);
    void (async () => {
      try {
        const friendships = await social.getFriendships(user.id);
        const connected = friendships.some(
          (item) =>
            item.status === "accepted" &&
            ((item.user_id === user.id && item.friend_id === friendId) ||
              (item.friend_id === user.id && item.user_id === friendId)),
        );
        if (!connected) throw new Error("Only connected buds can visit this garden.");
        const [owner, friendHabits, friendCustomPlants] = await Promise.all([
          profiles.getById(friendId),
          habitRepository.getByUserId(friendId),
          customPlantRepository.getVisibleForUser(friendId),
        ]);
        if (!owner) throw new Error("This gardener is unavailable.");
        if (!active) return;
        setProfile(owner);
        setHabits(friendHabits.filter((item) => item.is_public));
        setCustomPlants(friendCustomPlants);
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Unable to open this garden");
        setProfile(null);
        setHabits([]);
        setCustomPlants([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [customPlantRepository, friendId, habitRepository, profiles, requestId, social, user]);

  useRealtimeRefresh({
    channelName: `friend-garden-${user?.id ?? "signed-out"}-${friendId ?? "missing"}`,
    tables: friendGardenRealtimeTables,
    enabled: Boolean(friendId && user),
    onChange: () => void refresh(),
  });

  return { profile, habits, customPlants, error, refresh };
}
