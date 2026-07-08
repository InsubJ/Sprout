import { SupabaseClient } from '@supabase/supabase-js';
import { Habit, CreateHabitInput, UpdateHabitInput } from '../types/habit';
import { validateCreateHabitInput, validateUpdateHabitInput, ValidationError } from '../utils/habitValidation';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export class HabitServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HabitServiceError';
  }
}

export class HabitValidationError extends HabitServiceError {
  public errors: ValidationError[];
  constructor(message: string, errors: ValidationError[] = []) {
    super(message);
    this.name = 'HabitValidationError';
    this.errors = errors;
  }
}

export class HabitNotFoundError extends HabitServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'HabitNotFoundError';
  }
}

export class HabitDatabaseError extends HabitServiceError {
  public originalError: any;
  constructor(message: string, originalError?: any) {
    super(message);
    this.name = 'HabitDatabaseError';
    this.originalError = originalError;
  }
}

export class HabitService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    if (!supabaseClient) {
      throw new Error('Supabase client is required');
    }
    this.supabase = supabaseClient;
  }

  /**
   * Retrieves all habits belonging to a specific user.
   * @param userId The UUID of the user.
   * @returns A promise that resolves to an array of Habit objects.
   * @throws HabitValidationError if the userId is not a valid UUID.
   * @throws HabitDatabaseError if the query fails.
   */
  async getHabits(userId: string): Promise<Habit[]> {
    if (!isValidUuid(userId)) {
      throw new HabitValidationError('User ID must be a valid UUID');
    }

    const { data, error } = await this.supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new HabitDatabaseError(`Failed to fetch habits for user: ${error.message}`, error);
    }

    return data as Habit[];
  }

  /**
   * Retrieves a single habit by its ID.
   * @param habitId The UUID of the habit.
   * @returns A promise that resolves to the Habit object.
   * @throws HabitValidationError if the habitId is not a valid UUID.
   * @throws HabitNotFoundError if no habit with the specified ID exists.
   * @throws HabitDatabaseError if the query fails.
   */
  async getHabitById(habitId: string): Promise<Habit> {
    if (!isValidUuid(habitId)) {
      throw new HabitValidationError('Habit ID must be a valid UUID');
    }

    const { data, error } = await this.supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new HabitNotFoundError(`Habit with ID ${habitId} not found`);
      }
      throw new HabitDatabaseError(`Failed to fetch habit: ${error.message}`, error);
    }

    if (!data) {
      throw new HabitNotFoundError(`Habit with ID ${habitId} not found`);
    }

    return data as Habit;
  }

  /**
   * Creates a new habit plant.
   * @param input Data required to create the habit.
   * @returns A promise that resolves to the newly created Habit.
   * @throws HabitValidationError if validation fails.
   * @throws HabitDatabaseError if the database insertion fails.
   */
  async createHabit(input: CreateHabitInput): Promise<Habit> {
    const validation = validateCreateHabitInput(input);
    if (!validation.success || !validation.data) {
      throw new HabitValidationError('Invalid create habit input', validation.errors || []);
    }

    const { data, error } = await this.supabase
      .from('habits')
      .insert([validation.data])
      .select()
      .single();

    if (error) {
      throw new HabitDatabaseError(`Failed to create habit: ${error.message}`, error);
    }

    if (!data) {
      throw new HabitDatabaseError('Failed to retrieve created habit data');
    }

    return data as Habit;
  }

  /**
   * Updates an existing habit.
   * @param habitId The UUID of the habit to update.
   * @param input Fields to update.
   * @returns A promise that resolves to the updated Habit.
   * @throws HabitValidationError if validation fails or habitId is invalid.
   * @throws HabitNotFoundError if the habit does not exist.
   * @throws HabitDatabaseError if the database update fails.
   */
  async updateHabit(habitId: string, input: UpdateHabitInput): Promise<Habit> {
    if (!isValidUuid(habitId)) {
      throw new HabitValidationError('Habit ID must be a valid UUID');
    }

    const validation = validateUpdateHabitInput(input);
    if (!validation.success || !validation.data) {
      throw new HabitValidationError('Invalid update habit input', validation.errors || []);
    }

    const { data, error } = await this.supabase
      .from('habits')
      .update(validation.data)
      .eq('id', habitId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new HabitNotFoundError(`Habit with ID ${habitId} not found`);
      }
      throw new HabitDatabaseError(`Failed to update habit: ${error.message}`, error);
    }

    if (!data) {
      throw new HabitNotFoundError(`Habit with ID ${habitId} not found`);
    }

    return data as Habit;
  }

  /**
   * Deletes a habit from the database.
   * @param habitId The UUID of the habit to delete.
   * @returns A promise that resolves when the habit is deleted.
   * @throws HabitValidationError if the habitId is not a valid UUID.
   * @throws HabitNotFoundError if the habit does not exist.
   * @throws HabitDatabaseError if the database deletion fails.
   */
  async deleteHabit(habitId: string): Promise<void> {
    if (!isValidUuid(habitId)) {
      throw new HabitValidationError('Habit ID must be a valid UUID');
    }

    const { data, error } = await this.supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .select();

    if (error) {
      throw new HabitDatabaseError(`Failed to delete habit: ${error.message}`, error);
    }

    if (!data || data.length === 0) {
      throw new HabitNotFoundError(`Habit with ID ${habitId} not found`);
    }
  }
}
