import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  LogService,
  LogValidationError,
  LogDatabaseError
} from '../services/logService';
import { HabitLog, CreateHabitLogInput } from '../types/habitLog';

// A mock builder to simulate Supabase query builder chains
class SupabaseQueryMockBuilder {
  public select = vi.fn().mockReturnValue(this);
  public insert = vi.fn().mockReturnValue(this);
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

describe('LogService', () => {
  let mockBuilder: SupabaseQueryMockBuilder;
  let mockSupabase: any;
  let service: LogService;

  const validUserId = '123e4567-e89b-12d3-a456-426614174000';
  const validHabitId = '987f6543-e21b-34d5-c678-987654321000';
  const validLogId = '11111111-2222-3333-4444-555555555555';

  const mockLog: HabitLog = {
    id: validLogId,
    habit_id: validHabitId,
    user_id: validUserId,
    created_at: new Date().toISOString()
  };

  beforeEach(() => {
    mockBuilder = new SupabaseQueryMockBuilder();
    mockSupabase = {
      from: vi.fn().mockReturnValue(mockBuilder)
    };
    service = new LogService(mockSupabase);
  });

  describe('Constructor', () => {
    it('should throw error if supabase client is not provided', () => {
      expect(() => new LogService(null as any)).toThrow('Supabase client is required');
    });
  });

  describe('createLog', () => {
    const createInput: CreateHabitLogInput = {
      habit_id: validHabitId,
      user_id: validUserId
    };

    it('should log a check-in successfully', async () => {
      mockBuilder.setResult(mockLog);

      const result = await service.createLog(createInput);

      expect(mockSupabase.from).toHaveBeenCalledWith('habit_logs');
      expect(mockBuilder.insert).toHaveBeenCalledWith([expect.objectContaining({ habit_id: validHabitId })]);
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.single).toHaveBeenCalled();
      expect(result).toEqual(mockLog);
    });

    it('should throw LogValidationError if validation fails', async () => {
      const invalidInput: CreateHabitLogInput = {
        habit_id: 'invalid-uuid',
        user_id: ''
      };

      await expect(service.createLog(invalidInput)).rejects.toThrow(LogValidationError);
    });

    it('should throw LogDatabaseError if insertion fails', async () => {
      mockBuilder.setResult(null, { message: 'Database insert failed' });

      await expect(service.createLog(createInput)).rejects.toThrow(LogDatabaseError);
    });
  });

  describe('getLogsByHabitId', () => {
    it('should retrieve logs for a habit successfully', async () => {
      const logs = [mockLog];
      mockBuilder.setResult(logs);

      const result = await service.getLogsByHabitId(validHabitId);

      expect(mockSupabase.from).toHaveBeenCalledWith('habit_logs');
      expect(mockBuilder.select).toHaveBeenCalledWith('*');
      expect(mockBuilder.eq).toHaveBeenCalledWith('habit_id', validHabitId);
      expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(logs);
    });

    it('should throw LogValidationError if habitId is not a valid UUID', async () => {
      await expect(service.getLogsByHabitId('invalid-uuid')).rejects.toThrow(LogValidationError);
    });

    it('should throw LogDatabaseError if database query fails', async () => {
      mockBuilder.setResult(null, { message: 'Select failed' });

      await expect(service.getLogsByHabitId(validHabitId)).rejects.toThrow(LogDatabaseError);
    });
  });

  describe('getLogsByUserId', () => {
    it('should retrieve logs for a user successfully', async () => {
      const logs = [mockLog];
      mockBuilder.setResult(logs);

      const result = await service.getLogsByUserId(validUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith('habit_logs');
      expect(mockBuilder.select).toHaveBeenCalledWith('*');
      expect(mockBuilder.eq).toHaveBeenCalledWith('user_id', validUserId);
      expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(logs);
    });

    it('should throw LogValidationError if userId is not a valid UUID', async () => {
      await expect(service.getLogsByUserId('invalid-uuid')).rejects.toThrow(LogValidationError);
    });

    it('should throw LogDatabaseError if database query fails', async () => {
      mockBuilder.setResult(null, { message: 'Select failed' });

      await expect(service.getLogsByUserId(validUserId)).rejects.toThrow(LogDatabaseError);
    });
  });
});
