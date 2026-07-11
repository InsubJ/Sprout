import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  HabitService,
  HabitValidationError,
  HabitNotFoundError,
  HabitDatabaseError
} from '../services/habitService';
import { CreateHabitInput, UpdateHabitInput, Habit } from '../types/habit';

// A mock builder to simulate Supabase query builder chains
class SupabaseQueryMockBuilder {
  public select = vi.fn().mockReturnValue(this);
  public insert = vi.fn().mockReturnValue(this);
  public update = vi.fn().mockReturnValue(this);
  public delete = vi.fn().mockReturnValue(this);
  public eq = vi.fn().mockReturnValue(this);
  public order = vi.fn().mockReturnValue(this);
  public single = vi.fn().mockReturnValue(this);

  private resolveValue: any = { data: null, error: null };

  setResult(data: any, error: any = null) {
    this.resolveValue = { data, error };
    return this;
  }

  then(resolve: any) {
    return Promise.resolve(this.resolveValue).then(resolve);
  }
}

describe('HabitService', () => {
  let mockBuilder: SupabaseQueryMockBuilder;
  let mockSupabase: any;
  let service: HabitService;

  const validUserId = '123e4567-e89b-12d3-a456-426614174000';
  const validHabitId = '987f6543-e21b-34d5-c678-987654321000';

  const mockHabit: Habit = {
    id: validHabitId,
    user_id: validUserId,
    name: 'Read a book',
    description: '10 pages daily',
    plant_type: 'bonsai',
    difficulty_tier: 'common',
    frequency: 'daily',
    flexible_rules: null,
    target_waterings: 30,
    current_waterings: 0,
    wither_threshold: 3,
    consecutive_misses: 0,
    wither_count: 0,
    status: 'healthy',
    poetic_summary: null,
    is_public: true,
    current_streak: 0,
    max_streak: 0,
    completed_at: null,
    created_at: new Date().toISOString()
  };

  beforeEach(() => {
    mockBuilder = new SupabaseQueryMockBuilder();
    mockSupabase = {
      from: vi.fn().mockReturnValue(mockBuilder)
    };
    service = new HabitService(mockSupabase);
  });

  describe('Constructor', () => {
    it('should throw error if supabase client is not provided', () => {
      expect(() => new HabitService(null as any)).toThrow('Supabase client is required');
    });
  });

  describe('getHabits', () => {
    it('should retrieve all habits for a user successfully', async () => {
      const habits = [mockHabit];
      mockBuilder.setResult(habits);

      const result = await service.getHabits(validUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith('habits');
      expect(mockBuilder.select).toHaveBeenCalledWith('*');
      expect(mockBuilder.eq).toHaveBeenCalledWith('user_id', validUserId);
      expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(habits);
    });

    it('should throw HabitValidationError if userId is not a valid UUID', async () => {
      await expect(service.getHabits('invalid-uuid')).rejects.toThrow(HabitValidationError);
    });

    it('should throw HabitDatabaseError if database fetch fails', async () => {
      mockBuilder.setResult(null, { message: 'Database failure' });

      await expect(service.getHabits(validUserId)).rejects.toThrow(HabitDatabaseError);
    });
  });

  describe('getHabitById', () => {
    it('should retrieve a habit by id successfully', async () => {
      mockBuilder.setResult(mockHabit);

      const result = await service.getHabitById(validHabitId);

      expect(mockSupabase.from).toHaveBeenCalledWith('habits');
      expect(mockBuilder.select).toHaveBeenCalledWith('*');
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', validHabitId);
      expect(mockBuilder.single).toHaveBeenCalled();
      expect(result).toEqual(mockHabit);
    });

    it('should throw HabitNotFoundError if habit does not exist (PGRST116 code)', async () => {
      mockBuilder.setResult(null, { code: 'PGRST116', message: 'No rows found' });

      await expect(service.getHabitById(validHabitId)).rejects.toThrow(HabitNotFoundError);
    });

    it('should throw HabitNotFoundError if habit query returns null data', async () => {
      mockBuilder.setResult(null);

      await expect(service.getHabitById(validHabitId)).rejects.toThrow(HabitNotFoundError);
    });

    it('should throw HabitValidationError if habitId is not a valid UUID', async () => {
      await expect(service.getHabitById('invalid-uuid')).rejects.toThrow(HabitValidationError);
    });

    it('should throw HabitDatabaseError on other database failures', async () => {
      mockBuilder.setResult(null, { code: 'OTHER_ERROR', message: 'DB Connection Error' });

      await expect(service.getHabitById(validHabitId)).rejects.toThrow(HabitDatabaseError);
    });
  });

  describe('createHabit', () => {
    const createInput: CreateHabitInput = {
      user_id: validUserId,
      name: 'Drink Water',
      target_waterings: 20
    };

    it('should create a habit successfully', async () => {
      mockBuilder.setResult(mockHabit);

      const result = await service.createHabit(createInput);

      expect(mockSupabase.from).toHaveBeenCalledWith('habits');
      expect(mockBuilder.insert).toHaveBeenCalledWith([expect.objectContaining({ name: 'Drink Water' })]);
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.single).toHaveBeenCalled();
      expect(result).toEqual(mockHabit);
    });

    it('should throw HabitValidationError if validation fails', async () => {
      const invalidInput: CreateHabitInput = {
        user_id: 'invalid-uuid',
        name: ''
      };

      await expect(service.createHabit(invalidInput)).rejects.toThrow(HabitValidationError);
    });

    it('should throw HabitDatabaseError if insertion fails', async () => {
      mockBuilder.setResult(null, { message: 'Insert failed' });

      await expect(service.createHabit(createInput)).rejects.toThrow(HabitDatabaseError);
    });
  });

  describe('updateHabit', () => {
    const updateInput: UpdateHabitInput = {
      name: 'Read 20 Pages',
      current_waterings: 5
    };

    it('should update a habit successfully', async () => {
      const updatedHabit = { ...mockHabit, name: 'Read 20 Pages', current_waterings: 5 };
      mockBuilder.setResult(updatedHabit);

      const result = await service.updateHabit(validHabitId, updateInput);

      expect(mockSupabase.from).toHaveBeenCalledWith('habits');
      expect(mockBuilder.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Read 20 Pages' }));
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', validHabitId);
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.single).toHaveBeenCalled();
      expect(result).toEqual(updatedHabit);
    });

    it('should throw HabitValidationError if habitId is not a valid UUID', async () => {
      await expect(service.updateHabit('invalid-uuid', updateInput)).rejects.toThrow(HabitValidationError);
    });

    it('should throw HabitValidationError if update input is invalid', async () => {
      const invalidInput = { name: '' }; // empty name is invalid

      await expect(service.updateHabit(validHabitId, invalidInput)).rejects.toThrow(HabitValidationError);
    });

    it('should throw HabitNotFoundError if updating a non-existent habit (PGRST116 code)', async () => {
      mockBuilder.setResult(null, { code: 'PGRST116', message: 'No rows updated' });

      await expect(service.updateHabit(validHabitId, updateInput)).rejects.toThrow(HabitNotFoundError);
    });

    it('should throw HabitNotFoundError if update query returns null data', async () => {
      mockBuilder.setResult(null);

      await expect(service.updateHabit(validHabitId, updateInput)).rejects.toThrow(HabitNotFoundError);
    });

    it('should throw HabitDatabaseError on other database failures', async () => {
      mockBuilder.setResult(null, { code: 'UPDATE_FAILED', message: 'DB Error' });

      await expect(service.updateHabit(validHabitId, updateInput)).rejects.toThrow(HabitDatabaseError);
    });
  });

  describe('deleteHabit', () => {
    it('should delete a habit successfully', async () => {
      mockBuilder.setResult([mockHabit]); // returns array containing deleted habit when select() is chained

      await service.deleteHabit(validHabitId);

      expect(mockSupabase.from).toHaveBeenCalledWith('habits');
      expect(mockBuilder.delete).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', validHabitId);
      expect(mockBuilder.select).toHaveBeenCalled();
    });

    it('should throw HabitValidationError if habitId is not a valid UUID', async () => {
      await expect(service.deleteHabit('invalid-uuid')).rejects.toThrow(HabitValidationError);
    });

    it('should throw HabitNotFoundError if habit to delete is not found', async () => {
      mockBuilder.setResult([]); // empty array returned if no rows deleted

      await expect(service.deleteHabit(validHabitId)).rejects.toThrow(HabitNotFoundError);
    });

    it('should throw HabitDatabaseError on database failure', async () => {
      mockBuilder.setResult(null, { message: 'Delete failed' });

      await expect(service.deleteHabit(validHabitId)).rejects.toThrow(HabitDatabaseError);
    });
  });
});
