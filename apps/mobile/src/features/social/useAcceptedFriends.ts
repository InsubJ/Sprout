import { useEffect, useState } from "react";
import type { Profile } from "@sprout/shared";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";

export function useAcceptedFriends(enabled = true): Profile[] {
  const { user } = useAuth();
  const { social, profiles } = useServices();
  const [friends, setFriends] = useState<Profile[]>([]);
  useEffect(() => {
    let active = true;
    if (!enabled || !user || !social || !profiles) {
      setFriends([]);
      return () => {
        active = false;
      };
    }
    void social
      .getFriendships(user.id)
      .then(async (items) => {
        const ids = items
          .filter((item) => item.status === "accepted")
          .map((item) => (item.user_id === user.id ? item.friend_id : item.user_id));
        const resolved = await Promise.all(ids.map((id) => profiles.getById(id)));
        if (active) setFriends(resolved.filter((profile): profile is Profile => Boolean(profile)));
      })
      .catch(() => {
        if (active) setFriends([]);
      });
    return () => {
      active = false;
    };
  }, [enabled, profiles, social, user]);
  return friends;
}
