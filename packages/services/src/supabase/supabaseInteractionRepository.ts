import type {
  CreateCommentInput,
  LogComment,
  LogReaction,
  ToggleReactionInput,
} from "@sprout/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { RepositoryError } from "../errors/repositoryError";
import type { InteractionRepository } from "../repositories/interactionRepository";
import { toRepositoryError } from "./supabaseFailure";

export class SupabaseInteractionRepository implements InteractionRepository {
  constructor(private readonly client: SupabaseClient) {
    if (!client) throw new Error("Supabase client is required");
  }
  async getComments(logId: string): Promise<LogComment[]> {
    if (!logId.trim()) throw new RepositoryError("Log ID is required", "validation");
    const { data, error } = await this.client
      .from("log_comments")
      .select("*")
      .eq("log_id", logId)
      .order("created_at");
    if (error) throw toRepositoryError("Unable to load comments", error);
    return (data ?? []) as LogComment[];
  }
  async createComment(input: CreateCommentInput): Promise<LogComment> {
    if (!input.log_id.trim() || !input.user_id.trim() || !input.content.trim())
      throw new RepositoryError("Log, user and comment are required", "validation");
    const { data, error } = await this.client
      .from("log_comments")
      .insert({ ...input, content: input.content.trim() })
      .select()
      .single();
    if (error) throw toRepositoryError("Unable to comment", error);
    return data as LogComment;
  }
  async getReactions(logId: string): Promise<LogReaction[]> {
    if (!logId.trim()) throw new RepositoryError("Log ID is required", "validation");
    const { data, error } = await this.client.from("log_reactions").select("*").eq("log_id", logId);
    if (error) throw toRepositoryError("Unable to load reactions", error);
    return (data ?? []) as LogReaction[];
  }
  async toggleReaction(input: ToggleReactionInput): Promise<LogReaction | null> {
    if (!input.log_id.trim() || !input.user_id.trim() || !input.reaction_type.trim())
      throw new RepositoryError("Log, user and reaction are required", "validation");
    const { data: existing, error: findError } = await this.client
      .from("log_reactions")
      .select("*")
      .eq("log_id", input.log_id)
      .eq("user_id", input.user_id)
      .eq("reaction_type", input.reaction_type)
      .maybeSingle();
    if (findError) throw toRepositoryError("Unable to check reaction", findError);
    if (existing) {
      const { error } = await this.client.from("log_reactions").delete().eq("id", existing.id);
      if (error) throw toRepositoryError("Unable to remove reaction", error);
      return null;
    }
    const { data, error } = await this.client.from("log_reactions").insert(input).select().single();
    if (error) throw toRepositoryError("Unable to react", error);
    return data as LogReaction;
  }
}
