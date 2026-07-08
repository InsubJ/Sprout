import { SupabaseClient } from '@supabase/supabase-js';
import { LogComment, CreateCommentInput, LogReaction, ToggleReactionInput } from '../types/interaction';
import { validateCreateCommentInput, validateToggleReactionInput } from '../utils/interactionValidation';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export class InteractionServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InteractionServiceError';
  }
}

export class InteractionValidationError extends InteractionServiceError {
  public errors: any[];
  constructor(message: string, errors: any[] = []) {
    super(message);
    this.name = 'InteractionValidationError';
    this.errors = errors;
  }
}

export class InteractionNotFoundError extends InteractionServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'InteractionNotFoundError';
  }
}

export class InteractionDatabaseError extends InteractionServiceError {
  public originalError: any;
  constructor(message: string, originalError?: any) {
    super(message);
    this.name = 'InteractionDatabaseError';
    this.originalError = originalError;
  }
}

export class InteractionService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    if (!supabaseClient) {
      throw new Error('Supabase client is required');
    }
    this.supabase = supabaseClient;
  }

  /**
   * Adds a comment to a habit log.
   * Preconditions:
   * - log_id must be a valid UUID.
   * - user_id must be a valid UUID.
   * - content must be a non-blank string.
   */
  async addComment(input: CreateCommentInput): Promise<LogComment> {
    const validation = validateCreateCommentInput(input);
    if (!validation.success || !validation.data) {
      throw new InteractionValidationError('Invalid create comment input', validation.errors || []);
    }

    const { data, error } = await this.supabase
      .from('log_comments')
      .insert([validation.data])
      .select()
      .single();

    if (error) {
      throw new InteractionDatabaseError(`Failed to add comment: ${error.message}`, error);
    }

    if (!data) {
      throw new InteractionDatabaseError('Failed to retrieve created comment data');
    }

    return data as LogComment;
  }

  /**
   * Deletes a comment by ID.
   * Preconditions:
   * - commentId must be a valid UUID.
   */
  async deleteComment(commentId: string): Promise<void> {
    if (!isValidUuid(commentId)) {
      throw new InteractionValidationError('Comment ID must be a valid UUID');
    }

    const { data, error } = await this.supabase
      .from('log_comments')
      .delete()
      .eq('id', commentId)
      .select();

    if (error) {
      throw new InteractionDatabaseError(`Failed to delete comment: ${error.message}`, error);
    }

    if (!data || data.length === 0) {
      throw new InteractionNotFoundError(`Comment with ID ${commentId} not found`);
    }
  }

  /**
   * Toggles a reaction on a habit log.
   * If the user already has this specific reaction_type on the log, it is removed.
   * Otherwise, it is added.
   * Preconditions:
   * - log_id must be a valid UUID.
   * - user_id must be a valid UUID.
   * - reaction_type must be a non-blank string.
   */
  async toggleReaction(input: ToggleReactionInput): Promise<LogReaction | null> {
    const validation = validateToggleReactionInput(input);
    if (!validation.success || !validation.data) {
      throw new InteractionValidationError('Invalid toggle reaction input', validation.errors || []);
    }

    const { log_id, user_id, reaction_type } = validation.data;

    // Check if the reaction already exists
    const { data: existingReaction, error: fetchError } = await this.supabase
      .from('log_reactions')
      .select('*')
      .eq('log_id', log_id)
      .eq('user_id', user_id)
      .eq('reaction_type', reaction_type)
      .maybeSingle();

    if (fetchError) {
      throw new InteractionDatabaseError(`Failed to query existing reaction: ${fetchError.message}`, fetchError);
    }

    if (existingReaction) {
      // Remove existing reaction
      const { error: deleteError } = await this.supabase
        .from('log_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        throw new InteractionDatabaseError(`Failed to remove reaction: ${deleteError.message}`, deleteError);
      }

      return null;
    } else {
      // Add reaction
      const { data, error: insertError } = await this.supabase
        .from('log_reactions')
        .insert([{ log_id, user_id, reaction_type }])
        .select()
        .single();

      if (insertError) {
        throw new InteractionDatabaseError(`Failed to add reaction: ${insertError.message}`, insertError);
      }

      if (!data) {
        throw new InteractionDatabaseError('Failed to retrieve created reaction data');
      }

      return data as LogReaction;
    }
  }

  /**
   * Retrieves all comments for a habit log.
   * Preconditions:
   * - logId must be a valid UUID.
   */
  async getCommentsByLogId(logId: string): Promise<LogComment[]> {
    if (!isValidUuid(logId)) {
      throw new InteractionValidationError('Log ID must be a valid UUID');
    }

    const { data, error } = await this.supabase
      .from('log_comments')
      .select('*')
      .eq('log_id', logId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new InteractionDatabaseError(`Failed to fetch comments for log: ${error.message}`, error);
    }

    return (data || []) as LogComment[];
  }

  /**
   * Retrieves all reactions for a habit log.
   * Preconditions:
   * - logId must be a valid UUID.
   */
  async getReactionsByLogId(logId: string): Promise<LogReaction[]> {
    if (!isValidUuid(logId)) {
      throw new InteractionValidationError('Log ID must be a valid UUID');
    }

    const { data, error } = await this.supabase
      .from('log_reactions')
      .select('*')
      .eq('log_id', logId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new InteractionDatabaseError(`Failed to fetch reactions for log: ${error.message}`, error);
    }

    return (data || []) as LogReaction[];
  }
}
