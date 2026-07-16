import { useCallback, useEffect, useRef, useState } from "react";
import type { Profile } from "@sprout/shared";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";

const acceptedFriendsRealtimeTables = ["friendships", "profiles"] as const;

export function useAcceptedFriends(enabled = true): Profile[] {
  const { user } = useAuth();
  const { social, profiles } = useServices();
  const [friends, setFriends] = useState<Profile[]>([]);
  const requestId = useRef(0);
  const refresh = useCallback((): void => {
    const request = ++requestId.current;
    if (!enabled || !user || !social || !profiles) {
      setFriends([]);
      return;
    }
    void social
      .getFriendships(user.id)
      .then(async (items) => {
        const ids = items
          .filter((item) => item.status === "accepted")
          .map((item) => (item.user_id === user.id ? item.friend_id : item.user_id));
        const resolved = await Promise.all(ids.map((id) => profiles.getById(id)));
        if (request === requestId.current)
          setFriends(resolved.filter((profile): profile is Profile => Boolean(profile)));
      })
      .catch(() => {
        if (request === requestId.current) setFriends([]);
      });
  }, [enabled, profiles, social, user]);

  useEffect(() => {
    refresh();
    return () => {
      requestId.current += 1;
    };
  }, [refresh]);
  useRealtimeRefresh({
    channelName: `accepted-friends-${user?.id ?? "signed-out"}`,
    tables: acceptedFriendsRealtimeTables,
    enabled: enabled && Boolean(user),
    onChange: refresh,
  });
  return friends;
}
