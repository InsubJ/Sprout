import type { Friendship, WitherNudge } from "@sprout/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { RepositoryError } from "../errors/repositoryError";
import type { SocialRepository } from "../repositories/socialRepository";
import { toRepositoryError } from "./supabaseFailure";

export class SupabaseSocialRepository implements SocialRepository {
  constructor(private readonly client: SupabaseClient) {
    if (!client) throw new Error("Supabase client is required");
  }
  async getFriendships(userId: string): Promise<Friendship[]> {
    if (!userId.trim()) throw new RepositoryError("User ID is required", "validation");
    const { data, error } = await this.client
      .from("friendships")
      .select("*")
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
    if (error) throw toRepositoryError("Unable to load friends", error);
    return (data ?? []) as Friendship[];
  }
  async sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    if (!userId.trim() || !friendId.trim() || userId === friendId)
      throw new RepositoryError("Choose another gardener", "validation");
    const { data, error } = await this.client
      .from("friendships")
      .insert({ user_id: userId, friend_id: friendId, status: "pending" })
      .select()
      .single();
    if (error) throw toRepositoryError("Unable to send request", error);
    return data as Friendship;
  }
  async cancelFriendRequest(friendshipId: string, requesterId: string): Promise<void> {
    if (!friendshipId.trim() || !requesterId.trim())
      throw new RepositoryError("Friendship and requester IDs are required", "validation");
    const { data, error } = await this.client
      .from("friendships")
      .delete()
      .eq("id", friendshipId)
      .eq("user_id", requesterId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (error) throw toRepositoryError("Unable to cancel request", error);
    if (!data) throw new RepositoryError("Outgoing friend request not found", "not_found");
  }
  async respond(friendshipId: string, status: "accepted" | "declined"): Promise<Friendship> {
    if (!friendshipId.trim()) throw new RepositoryError("Friendship ID is required", "validation");
    const { data, error } = await this.client
      .from("friendships")
      .update({ status })
      .eq("id", friendshipId)
      .select()
      .single();
    if (error?.code === "PGRST116")
      throw new RepositoryError("Friend request not found", "not_found", { cause: error });
    if (error) throw toRepositoryError("Unable to respond", error);
    return data as Friendship;
  }
  async getNudgedHabitIds(senderId: string, receiverId: string, date: string): Promise<string[]> {
    if (!senderId.trim() || !receiverId.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw new RepositoryError("Valid sender, receiver and date are required", "validation");
    const { data, error } = await this.client
      .from("wither_nudges")
      .select("habit_id")
      .eq("sender_id", senderId)
      .eq("receiver_id", receiverId)
      .eq("nudged_at", date);
    if (error) throw toRepositoryError("Unable to load nudges", error);
    return (data ?? []).map((row) => row.habit_id as string);
  }
  async sendNudge(senderId: string, receiverId: string, habitId: string): Promise<WitherNudge> {
    if (!senderId.trim() || !receiverId.trim() || !habitId.trim() || senderId === receiverId)
      throw new RepositoryError("Valid sender, receiver and habit IDs are required", "validation");
    const { data, error } = await this.client
      .from("wither_nudges")
      .insert({ sender_id: senderId, receiver_id: receiverId, habit_id: habitId })
      .select()
      .single();
    if (error) throw toRepositoryError("Unable to send nudge", error);
    return data as WitherNudge;
  }
}
