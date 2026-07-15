import type { Profile } from "@sprout/shared";
import { filterFriendsForVisibility, friendsForVisibilityPicker } from "./useFriendExceptionPicker";

const friends: Profile[] = [
  {
    id: "1",
    username: "fern_friend",
    display_name: "Alex Green",
    avatar_url: null,
    created_at: "2026-07-13T00:00:00Z",
  },
  {
    id: "2",
    username: "mossy",
    display_name: "Bailey Moss",
    avatar_url: null,
    created_at: "2026-07-13T00:00:00Z",
  },
];

describe("friend visibility search", () => {
  it("searches accepted friends by display name", () => {
    expect(filterFriendsForVisibility(friends, "alex").map((friend) => friend.id)).toEqual(["1"]);
  });

  it("searches accepted friends by username without case sensitivity", () => {
    expect(filterFriendsForVisibility(friends, "MOSSY").map((friend) => friend.id)).toEqual(["2"]);
  });

  it("returns every friend for an empty search", () => {
    expect(filterFriendsForVisibility(friends, "  ")).toHaveLength(2);
  });

  it("limits the unfiltered quick-add list to five friends", () => {
    const manyFriends = Array.from({ length: 8 }, (_, index) => ({
      ...friends[0],
      id: String(index),
      username: `friend_${index}`,
      display_name: `Friend ${index}`,
    }));

    expect(friendsForVisibilityPicker(manyFriends, "")).toHaveLength(5);
    expect(friendsForVisibilityPicker(manyFriends, "friend_7").map((friend) => friend.id)).toEqual([
      "7",
    ]);
  });
});
