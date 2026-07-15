import { useCallback, useEffect, useRef, useState } from "react";
import type { Friendship, Profile } from "@sprout/shared";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";

export interface BudRow {
  friendship: Friendship;
  profile: Profile;
}
const demoProfile: Profile = {
  id: "33333333-3333-3333-3333-333333333333",
  username: "willow",
  display_name: "Willow",
  avatar_url: null,
  created_at: new Date().toISOString(),
};
export interface BudsState {
  isDemo: boolean;
  results: Profile[];
  friends: BudRow[];
  incoming: BudRow[];
  outgoing: BudRow[];
  workingRequestId: string | null;
  error: string | null;
  search: (query: string) => Promise<void>;
  add: (profile: Profile) => Promise<void>;
  respond: (friendship: Friendship, status: "accepted" | "declined") => Promise<void>;
  cancel: (friendship: Friendship) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useBuds(): BudsState {
  const { user } = useAuth();
  const { profiles, social, isDemo } = useServices();
  const [results, setResults] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<BudRow[]>([]);
  const [incoming, setIncoming] = useState<BudRow[]>([]);
  const [outgoing, setOutgoing] = useState<BudRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [workingRequestId, setWorkingRequestId] = useState<string | null>(null);
  const requestId = useRef(0);

  const resolveRows = useCallback(
    async (items: Friendship[], profileId: (item: Friendship) => string): Promise<BudRow[]> => {
      if (!profiles) return [];
      const rows = await Promise.all(
        items.map(async (friendship) => {
          const profile = await profiles.getById(profileId(friendship));
          return profile ? { friendship, profile } : null;
        }),
      );
      return rows.filter((row): row is BudRow => Boolean(row));
    },
    [profiles],
  );

  const refresh = useCallback(async (): Promise<void> => {
    const request = ++requestId.current;
    if (!user) return;
    setError(null);
    if (!social || !profiles) {
      if (request === requestId.current)
        setFriends([
          {
            friendship: {
              id: "demo-friendship",
              user_id: user.id,
              friend_id: demoProfile.id,
              status: "accepted",
              created_at: new Date().toISOString(),
            },
            profile: demoProfile,
          },
        ]);
      return;
    }
    try {
      const all = await social.getFriendships(user.id);
      const [nextIncoming, nextOutgoing, nextFriends] = await Promise.all([
        resolveRows(
          all.filter((item) => item.friend_id === user.id && item.status === "pending"),
          (item) => item.user_id,
        ),
        resolveRows(
          all.filter((item) => item.user_id === user.id && item.status === "pending"),
          (item) => item.friend_id,
        ),
        resolveRows(
          all.filter((item) => item.status === "accepted"),
          (item) => (item.user_id === user.id ? item.friend_id : item.user_id),
        ),
      ]);
      if (request !== requestId.current) return;
      setIncoming(nextIncoming);
      setOutgoing(nextOutgoing);
      setFriends(nextFriends);
    } catch (cause) {
      if (request === requestId.current)
        setError(cause instanceof Error ? cause.message : "Unable to load buds");
    }
  }, [profiles, resolveRows, social, user]);
  useEffect(() => {
    void refresh();
    return () => {
      requestId.current += 1;
    };
  }, [refresh]);
  const search = useCallback(
    async (query: string): Promise<void> => {
      if (!user || !profiles) {
        setResults([demoProfile]);
        return;
      }
      setResults(await profiles.search(query, user.id));
    },
    [profiles, user],
  );
  const add = useCallback(
    async (profile: Profile): Promise<void> => {
      if (!user || !social) {
        setResults((current) => current.filter((item) => item.id !== profile.id));
        return;
      }
      await social.sendFriendRequest(user.id, profile.id);
      setResults((current) => current.filter((item) => item.id !== profile.id));
      await refresh();
    },
    [refresh, social, user],
  );
  const respond = useCallback(
    async (friendship: Friendship, status: "accepted" | "declined"): Promise<void> => {
      if (!social) {
        setIncoming((current) => current.filter((item) => item.friendship.id !== friendship.id));
        return;
      }
      await social.respond(friendship.id, status);
      await refresh();
    },
    [refresh, social],
  );
  const cancel = useCallback(
    async (friendship: Friendship): Promise<void> => {
      if (!user || !social) {
        setOutgoing((current) => current.filter((item) => item.friendship.id !== friendship.id));
        return;
      }
      if (friendship.user_id !== user.id || friendship.status !== "pending")
        throw new Error("Only your pending outgoing requests can be cancelled");
      setWorkingRequestId(friendship.id);
      try {
        await social.cancelFriendRequest(friendship.id, user.id);
        await refresh();
      } finally {
        setWorkingRequestId(null);
      }
    },
    [refresh, social, user],
  );
  return {
    isDemo,
    results,
    friends,
    incoming,
    outgoing,
    workingRequestId,
    error,
    search,
    add,
    respond,
    cancel,
    refresh,
  };
}
