import { useMemo, useState } from "react";
import type { Profile } from "@sprout/shared";

export const FRIEND_QUICK_ADD_LIMIT = 5;

interface FriendExceptionPickerState {
  query: string;
  setQuery(value: string): void;
  visibleFriends: Profile[];
  selectedFriendIds: ReadonlySet<string>;
  toggleFriend(friendId: string): void;
}

export function filterFriendsForVisibility(friends: readonly Profile[], query: string): Profile[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return [...friends]
    .filter((friend) => {
      if (!normalizedQuery) return true;
      return [friend.display_name, friend.username].some((value) =>
        value?.toLocaleLowerCase().includes(normalizedQuery),
      );
    })
    .sort((left, right) =>
      (left.display_name ?? left.username).localeCompare(right.display_name ?? right.username),
    );
}

export function friendsForVisibilityPicker(friends: readonly Profile[], query: string): Profile[] {
  const matches = filterFriendsForVisibility(friends, query);
  return query.trim() ? matches : matches.slice(0, FRIEND_QUICK_ADD_LIMIT);
}

export function useFriendExceptionPicker(
  friends: readonly Profile[],
  selected: readonly string[],
  onChange: (friendIds: string[]) => void,
): FriendExceptionPickerState {
  const [query, setQuery] = useState("");
  const visibleFriends = useMemo(
    () => friendsForVisibilityPicker(friends, query),
    [friends, query],
  );
  const selectedFriendIds = useMemo(() => new Set(selected), [selected]);
  const toggleFriend = (friendId: string): void => {
    if (!friendId) throw new Error("Friend ID is required");
    onChange(
      selectedFriendIds.has(friendId)
        ? selected.filter((id) => id !== friendId)
        : [...selected, friendId],
    );
  };
  return { query, setQuery, visibleFriends, selectedFriendIds, toggleFriend };
}
