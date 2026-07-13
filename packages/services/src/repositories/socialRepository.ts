import type { Friendship, WitherNudge } from "@sprout/shared";
export interface SocialRepository {
  getFriendships(userId: string): Promise<Friendship[]>;
  sendFriendRequest(userId: string, friendId: string): Promise<Friendship>;
  respond(friendshipId: string, status: "accepted" | "declined"): Promise<Friendship>;
  getNudgedHabitIds(senderId: string, receiverId: string, date: string): Promise<string[]>;
  sendNudge(senderId: string, receiverId: string, habitId: string): Promise<WitherNudge>;
}
