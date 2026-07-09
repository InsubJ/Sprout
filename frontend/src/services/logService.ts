import { SupabaseClient } from '@supabase/supabase-js';
import { HabitLog, CreateHabitLogInput } from '../types/habitLog';
import { validateCreateHabitLogInput } from '../utils/logValidation';
import { ValidationError } from '../utils/habitValidation';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export class LogServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LogServiceError';
  }
}

export class LogValidationError extends LogServiceError {
  public errors: ValidationError[];
  constructor(message: string, errors: ValidationError[] = []) {
    super(message);
    this.name = 'LogValidationError';
    this.errors = errors;
  }
}

export class LogNotFoundError extends LogServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'LogNotFoundError';
  }
}

export class LogDatabaseError extends LogServiceError {
  public originalError: any;
  constructor(message: string, originalError?: any) {
    super(message);
    this.name = 'LogDatabaseError';
    this.originalError = originalError;
  }
}

export class LogService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    if (!supabaseClient) {
      throw new Error('Supabase client is required');
    }
    this.supabase = supabaseClient;
  }

  /**
   * Logs a new check-in (watering event) for a habit.
   * @param input Data required to create the log.
   * @returns A promise that resolves to the newly created HabitLog.
   * @throws LogValidationError if validation fails.
   * @throws LogDatabaseError if database insertion fails.
   */
  async createLog(input: CreateHabitLogInput): Promise<HabitLog> {
    const validation = validateCreateHabitLogInput(input);
    if (!validation.success || !validation.data) {
      throw new LogValidationError('Invalid create habit log input', validation.errors || []);
    }

    const { habit_id } = validation.data;

    // Fetch habit frequency to determine daily watering limits
    const { data: habit, error: habitError } = await this.supabase
      .from('habits')
      .select('frequency')
      .eq('id', habit_id)
      .single();

    if (!habitError && habit) {
      const logs = await this.getLogsByHabitId(habit_id);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const todayEnd = todayStart + 24 * 60 * 60 * 1000;

      const todaysLogs = Array.isArray(logs) ? logs.filter(l => {
        const time = new Date(l.created_at).getTime();
        return time >= todayStart && time < todayEnd;
      }) : [];

      const maxPerDay = habit.frequency === 'twice_daily' ? 2 : 1;
      if (todaysLogs.length >= maxPerDay) {
        throw new LogValidationError(`You can only water this plant ${maxPerDay} time(s) per day.`);
      }
    }

    const { data, error } = await this.supabase
      .from('habit_logs')
      .insert([validation.data])
      .select()
      .single();

    if (error) {
      throw new LogDatabaseError(`Failed to create habit log: ${error.message}`, error);
    }

    if (!data) {
      throw new LogDatabaseError('Failed to retrieve created habit log data');
    }

    return data as HabitLog;
  }

  /**
   * Retrieves all logs for a specific habit.
   * @param habitId The UUID of the habit.
   * @returns A promise that resolves to an array of HabitLog objects.
   * @throws LogValidationError if the habitId is not a valid UUID.
   * @throws LogDatabaseError if the query fails.
   */
  async getLogsByHabitId(habitId: string): Promise<HabitLog[]> {
    if (!isValidUuid(habitId)) {
      throw new LogValidationError('Habit ID must be a valid UUID');
    }

    const { data, error } = await this.supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new LogDatabaseError(`Failed to fetch logs for habit: ${error.message}`, error);
    }

    return data as HabitLog[];
  }

  /**
   * Retrieves all logs for a specific user.
   * @param userId The UUID of the user profile.
   * @returns A promise that resolves to an array of HabitLog objects.
   * @throws LogValidationError if the userId is not a valid UUID.
   * @throws LogDatabaseError if the query fails.
   */
  async getLogsByUserId(userId: string): Promise<HabitLog[]> {
    if (!isValidUuid(userId)) {
      throw new LogValidationError('User ID must be a valid UUID');
    }

    const { data, error } = await this.supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new LogDatabaseError(`Failed to fetch logs for user: ${error.message}`, error);
    }

    return data as HabitLog[];
  }
}
