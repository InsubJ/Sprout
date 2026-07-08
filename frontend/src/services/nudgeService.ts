import { SupabaseClient } from '@supabase/supabase-js';
import { WitherNudge, SendNudgeInput } from '../types/nudge';
import { validateSendNudgeInput } from '../utils/nudgeValidation';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export class NudgeServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NudgeServiceError';
  }
}

export class NudgeValidationError extends NudgeServiceError {
  public errors: any[];
  constructor(message: string, errors: any[] = []) {
    super(message);
    this.name = 'NudgeValidationError';
    this.errors = errors;
  }
}

export class NudgeDatabaseError extends NudgeServiceError {
  public originalError: any;
  constructor(message: string, originalError?: any) {
    super(message);
    this.name = 'NudgeDatabaseError';
    this.originalError = originalError;
  }
}

export class NudgeService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    if (!supabaseClient) {
      throw new Error('Supabase client is required');
    }
    this.supabase = supabaseClient;
  }

  /**
   * Sends a nudge to a friend's withered habit.
   * Preconditions:
   * - sender_id must be a valid UUID.
   * - receiver_id must be a valid UUID.
   * - habit_id must be a valid UUID.
   * - sender_id and receiver_id cannot be the same.
   */
  async sendNudge(input: SendNudgeInput): Promise<WitherNudge> {
    const validation = validateSendNudgeInput(input);
    if (!validation.success || !validation.data) {
      throw new NudgeValidationError('Invalid send nudge input', validation.errors || []);
    }

    const { data, error } = await this.supabase
      .from('wither_nudges')
      .insert([validation.data])
      .select()
      .single();

    if (error) {
      throw new NudgeDatabaseError(`Failed to send nudge: ${error.message}`, error);
    }

    if (!data) {
      throw new NudgeDatabaseError('Failed to retrieve created nudge data');
    }

    return data as WitherNudge;
  }

  /**
   * Retrieves all nudges sent for a specific habit.
   * Preconditions:
   * - habitId must be a valid UUID.
   */
  async getNudgesByHabitId(habitId: string): Promise<WitherNudge[]> {
    if (!isValidUuid(habitId)) {
      throw new NudgeValidationError('Habit ID must be a valid UUID');
    }

    const { data, error } = await this.supabase
      .from('wither_nudges')
      .select('*')
      .eq('habit_id', habitId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new NudgeDatabaseError(`Failed to fetch nudges: ${error.message}`, error);
    }

    return (data || []) as WitherNudge[];
  }

  /**
   * Checks if a user has already nudged a specific habit today.
   * Preconditions:
   * - senderId must be a valid UUID.
   * - habitId must be a valid UUID.
   */
  async hasUserNudgedToday(senderId: string, habitId: string): Promise<boolean> {
    if (!isValidUuid(senderId)) {
      throw new NudgeValidationError('Sender ID must be a valid UUID');
    }
    if (!isValidUuid(habitId)) {
      throw new NudgeValidationError('Habit ID must be a valid UUID');
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('wither_nudges')
      .select('*')
      .eq('sender_id', senderId)
      .eq('habit_id', habitId)
      .eq('nudged_at', todayStr)
      .maybeSingle();

    if (error) {
      throw new NudgeDatabaseError(`Failed to check nudge status: ${error.message}`, error);
    }

    return !!data;
  }
}
