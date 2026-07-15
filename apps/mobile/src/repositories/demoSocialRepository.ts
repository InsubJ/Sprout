import type AsyncStorageType from "@react-native-async-storage/async-storage";
import type { Friendship, WitherNudge } from "@sprout/shared";
import { RepositoryError, type SocialRepository } from "@sprout/services";

type Storage = Pick<typeof AsyncStorageType, "getItem" | "setItem">;
const willowId = "33333333-3333-3333-3333-333333333333";
const adminId = "11111111-1111-1111-1111-111111111111";
const aliceId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const bobId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
let friendships: Friendship[] = [];
let requestSequence = 0;

function dateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export class DemoSocialRepository implements SocialRepository {
  constructor(private readonly storage: Storage) {
    if (!storage) throw new Error("Demo social storage is required");
  }

  async getFriendships(userId: string): Promise<Friendship[]> {
    if (!userId.trim()) throw new RepositoryError("User ID is required", "validation");
    const existing = friendships.filter(
      (item) => item.user_id === userId || item.friend_id === userId,
    );
    if (existing.length) return existing;
    const createdAt = new Date().toISOString();
    const seeded: Friendship[] = [
      {
        id: `demo-friend-${userId}`,
        user_id: userId,
        friend_id: willowId,
        status: "accepted",
        created_at: createdAt,
      },
      ...(userId === adminId
        ? [
            {
              id: "demo-incoming-alice",
              user_id: aliceId,
              friend_id: adminId,
              status: "pending" as const,
              created_at: createdAt,
            },
            {
              id: "demo-outgoing-bob",
              user_id: adminId,
              friend_id: bobId,
              status: "pending" as const,
              created_at: createdAt,
            },
          ]
        : []),
    ];
    friendships = [...friendships, ...seeded];
    return seeded;
  }

  async sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    if (!userId.trim() || !friendId.trim() || userId === friendId)
      throw new RepositoryError("Choose another gardener", "validation");
    if (
      friendships.some(
        (item) =>
          item.status !== "declined" &&
          ((item.user_id === userId && item.friend_id === friendId) ||
            (item.user_id === friendId && item.friend_id === userId)),
      )
    )
      throw new RepositoryError("Friend request already exists", "conflict");
    const friendship: Friendship = {
      id: `demo-request-${Date.now()}-${++requestSequence}`,
      user_id: userId,
      friend_id: friendId,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    friendships = [...friendships, friendship];
    return friendship;
  }

  async cancelFriendRequest(friendshipId: string, requesterId: string): Promise<void> {
    if (!friendshipId.trim() || !requesterId.trim())
      throw new RepositoryError("Friendship and requester IDs are required", "validation");
    const existing = friendships.find(
      (item) =>
        item.id === friendshipId && item.user_id === requesterId && item.status === "pending",
    );
    if (!existing) throw new RepositoryError("Outgoing friend request not found", "not_found");
    friendships = friendships.filter((item) => item.id !== friendshipId);
  }

  async respond(friendshipId: string, status: "accepted" | "declined"): Promise<Friendship> {
    if (!friendshipId.trim()) throw new RepositoryError("Friendship ID is required", "validation");
    const existing = friendships.find((item) => item.id === friendshipId);
    if (!existing) throw new RepositoryError("Friend request not found", "not_found");
    const updated = { ...existing, status };
    friendships = friendships.map((item) => (item.id === friendshipId ? updated : item));
    return updated;
  }

  async getNudgedHabitIds(senderId: string, receiverId: string, date: string): Promise<string[]> {
    if (!senderId.trim() || !receiverId.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw new RepositoryError("Valid sender, receiver and date are required", "validation");
    const nudges = await this.readNudges();
    return nudges
      .filter(
        (item) =>
          item.sender_id === senderId && item.receiver_id === receiverId && item.nudged_at === date,
      )
      .map((item) => item.habit_id);
  }

  async sendNudge(senderId: string, receiverId: string, habitId: string): Promise<WitherNudge> {
    if (!senderId.trim() || !receiverId.trim() || !habitId.trim() || senderId === receiverId)
      throw new RepositoryError("Valid sender, receiver and habit IDs are required", "validation");
    const nudges = await this.readNudges();
    const today = dateKey();
    if (
      nudges.some(
        (item) =>
          item.sender_id === senderId && item.habit_id === habitId && item.nudged_at === today,
      )
    )
      throw new RepositoryError("You already nudged this plant today", "conflict");
    const nudge: WitherNudge = {
      id: `demo-nudge-${Date.now()}`,
      sender_id: senderId,
      receiver_id: receiverId,
      habit_id: habitId,
      nudged_at: today,
      created_at: new Date().toISOString(),
    };
    await this.storage.setItem("sprout_demo_nudges", JSON.stringify([...nudges, nudge]));
    return nudge;
  }

  private async readNudges(): Promise<WitherNudge[]> {
    const raw = await this.storage.getItem("sprout_demo_nudges");
    if (!raw) return [];
    try {
      return JSON.parse(raw) as WitherNudge[];
    } catch {
      return [];
    }
  }
}
