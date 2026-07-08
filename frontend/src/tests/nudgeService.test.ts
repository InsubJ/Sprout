import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  NudgeService,
  NudgeValidationError,
  NudgeDatabaseError
} from '../services/nudgeService';
import { WitherNudge } from '../types/nudge';

class SupabaseQueryMockBuilder {
  public select = vi.fn().mockReturnValue(this);
  public insert = vi.fn().mockReturnValue(this);
  public eq = vi.fn().mockReturnValue(this);
  public order = vi.fn().mockReturnValue(this);
  public single = vi.fn().mockReturnValue(this);
  public maybeSingle = vi.fn().mockReturnValue(this);

  private resolveValue: any = { data: null, error: null };

  setResult(data: any, error: any = null) {
    this.resolveValue = { data, error };
    return this;
  }

  then(resolve: any) {
    return Promise.resolve(this.resolveValue).then(resolve);
  }
}

describe('NudgeService', () => {
  let mockBuilder: SupabaseQueryMockBuilder;
  let mockSupabase: any;
  let service: NudgeService;

  const validSenderId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const validReceiverId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const validHabitId = '11111111-1111-1111-1111-111111111111';
  const validNudgeId = '22222222-2222-2222-2222-222222222222';

  const mockNudge: WitherNudge = {
    id: validNudgeId,
    sender_id: validSenderId,
    receiver_id: validReceiverId,
    habit_id: validHabitId,
    nudged_at: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  beforeEach(() => {
    mockBuilder = new SupabaseQueryMockBuilder();
    mockSupabase = {
      from: vi.fn().mockReturnValue(mockBuilder)
    };
    service = new NudgeService(mockSupabase);
  });

  describe('Constructor', () => {
    it('should throw error if supabase client is not provided', () => {
      expect(() => new NudgeService(null as any)).toThrow('Supabase client is required');
    });
  });

  describe('sendNudge', () => {
    const input = {
      sender_id: validSenderId,
      receiver_id: validReceiverId,
      habit_id: validHabitId
    };

    it('should send nudge successfully with valid inputs', async () => {
      mockBuilder.setResult(mockNudge);

      const result = await service.sendNudge(input);

      expect(mockSupabase.from).toHaveBeenCalledWith('wither_nudges');
      expect(mockBuilder.insert).toHaveBeenCalledWith([input]);
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.single).toHaveBeenCalled();
      expect(result).toEqual(mockNudge);
    });

    it('should throw NudgeValidationError if sender_id is invalid', async () => {
      const invalidInput = { ...input, sender_id: 'invalid-uuid' };
      await expect(service.sendNudge(invalidInput)).rejects.toThrow(NudgeValidationError);
    });

    it('should throw NudgeValidationError if receiver_id is invalid', async () => {
      const invalidInput = { ...input, receiver_id: 'invalid' };
      await expect(service.sendNudge(invalidInput)).rejects.toThrow(NudgeValidationError);
    });

    it('should throw NudgeValidationError if habit_id is invalid', async () => {
      const invalidInput = { ...input, habit_id: 'invalid' };
      await expect(service.sendNudge(invalidInput)).rejects.toThrow(NudgeValidationError);
    });

    it('should throw NudgeDatabaseError if database query fails', async () => {
      mockBuilder.setResult(null, { message: 'Database query failed' });
      await expect(service.sendNudge(input)).rejects.toThrow(NudgeDatabaseError);
    });
  });

  describe('getNudgesByHabitId', () => {
    it('should fetch nudges successfully', async () => {
      const nudges = [mockNudge];
      mockBuilder.setResult(nudges);

      const result = await service.getNudgesByHabitId(validHabitId);

      expect(mockSupabase.from).toHaveBeenCalledWith('wither_nudges');
      expect(mockBuilder.select).toHaveBeenCalledWith('*');
      expect(mockBuilder.eq).toHaveBeenCalledWith('habit_id', validHabitId);
      expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(nudges);
    });

    it('should throw NudgeValidationError if habitId is not a valid UUID', async () => {
      await expect(service.getNudgesByHabitId('invalid-uuid')).rejects.toThrow(NudgeValidationError);
    });

    it('should throw NudgeDatabaseError if database query fails', async () => {
      mockBuilder.setResult(null, { message: 'Fetch error' });
      await expect(service.getNudgesByHabitId(validHabitId)).rejects.toThrow(NudgeDatabaseError);
    });
  });

  describe('hasUserNudgedToday', () => {
    it('should return true if nudge exists today', async () => {
      mockBuilder.setResult(mockNudge);

      const result = await service.hasUserNudgedToday(validSenderId, validHabitId);

      expect(mockSupabase.from).toHaveBeenCalledWith('wither_nudges');
      expect(mockBuilder.select).toHaveBeenCalledWith('*');
      expect(mockBuilder.eq).toHaveBeenCalledWith('sender_id', validSenderId);
      expect(mockBuilder.eq).toHaveBeenCalledWith('habit_id', validHabitId);
      expect(mockBuilder.eq).toHaveBeenCalledWith('nudged_at', new Date().toISOString().split('T')[0]);
      expect(mockBuilder.maybeSingle).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if nudge does not exist today', async () => {
      mockBuilder.setResult(null);

      const result = await service.hasUserNudgedToday(validSenderId, validHabitId);
      expect(result).toBe(false);
    });

    it('should throw NudgeValidationError if senderId is invalid', async () => {
      await expect(service.hasUserNudgedToday('invalid', validHabitId)).rejects.toThrow(NudgeValidationError);
    });

    it('should throw NudgeValidationError if habitId is invalid', async () => {
      await expect(service.hasUserNudgedToday(validSenderId, 'invalid')).rejects.toThrow(NudgeValidationError);
    });

    it('should throw NudgeDatabaseError if database query fails', async () => {
      mockBuilder.setResult(null, { message: 'Database query failed' });
      await expect(service.hasUserNudgedToday(validSenderId, validHabitId)).rejects.toThrow(NudgeDatabaseError);
    });
  });
});
