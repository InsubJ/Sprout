import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WrappedService, WrappedValidationError, WrappedDatabaseError } from '../services/wrappedService';
import { Profile } from '../types/profile';

class MockQueryBuilder {
  public data: any;
  public error: any;

  constructor(data: any = null, error: any = null) {
    this.data = data;
    this.error = error;
  }

  select = vi.fn().mockReturnValue(this);
  eq = vi.fn().mockReturnValue(this);
  in = vi.fn().mockReturnValue(this);

  single = vi.fn().mockImplementation(() => {
    return Promise.resolve({
      data: Array.isArray(this.data) ? this.data[0] : this.data,
      error: this.error
    });
  });

  maybeSingle = vi.fn().mockImplementation(() => {
    return Promise.resolve({
      data: Array.isArray(this.data) ? (this.data[0] || null) : this.data,
      error: this.error
    });
  });

  then(resolve: any) {
    return Promise.resolve({ data: this.data, error: this.error }).then(resolve);
  }
}

describe('WrappedService', () => {
  let mockSupabase: any;
  let service: WrappedService;

  const validUserId = '11111111-1111-1111-1111-111111111111';
  const validFriendId = '22222222-2222-2222-2222-222222222222';
  const validHabitId = '33333333-3333-3333-3333-333333333333';
  const validLogId = '44444444-4444-4444-4444-444444444444';
  const targetYear = 2026;

  // Mock datasets
  let habitsData: any[] = [];
  let logsData: any[] = [];
  let nudgesData: any[] = [];
  let profilesData: any[] = [];
  let commentsData: any[] = [];
  let reactionsData: any[] = [];

  let queryBuilders: Record<string, MockQueryBuilder> = {};

  beforeEach(() => {
    habitsData = [];
    logsData = [];
    nudgesData = [];
    profilesData = [];
    commentsData = [];
    reactionsData = [];

    queryBuilders = {};

    mockSupabase = {
      from: vi.fn().mockImplementation((tableName: string) => {
        if (!queryBuilders[tableName]) {
          let data: any = [];
          if (tableName === 'habits') data = habitsData;
          else if (tableName === 'habit_logs') data = logsData;
          else if (tableName === 'wither_nudges') data = nudgesData;
          else if (tableName === 'profiles') data = profilesData;
          else if (tableName === 'log_comments') data = commentsData;
          else if (tableName === 'log_reactions') data = reactionsData;

          queryBuilders[tableName] = new MockQueryBuilder(data);
        }
        return queryBuilders[tableName];
      })
    };

    service = new WrappedService(mockSupabase);
  });

  describe('Constructor', () => {
    it('should throw error if supabase client is not provided', () => {
      expect(() => new WrappedService(null as any)).toThrow('Supabase client is required');
    });
  });

  describe('Design by Contract - Preconditions', () => {
    it('should throw WrappedValidationError if userId is missing', async () => {
      await expect(service.getYearlyWrapped('', targetYear)).rejects.toThrow(WrappedValidationError);
    });

    it('should throw WrappedValidationError if userId is not a valid UUID', async () => {
      await expect(service.getYearlyWrapped('not-a-uuid', targetYear)).rejects.toThrow(WrappedValidationError);
    });

    it('should throw WrappedValidationError if year is missing/invalid', async () => {
      await expect(service.getYearlyWrapped(validUserId, null as any)).rejects.toThrow(WrappedValidationError);
      await expect(service.getYearlyWrapped(validUserId, 1999)).rejects.toThrow(WrappedValidationError);
      await expect(service.getYearlyWrapped(validUserId, 2101)).rejects.toThrow(WrappedValidationError);
      await expect(service.getYearlyWrapped(validUserId, 2026.5)).rejects.toThrow(WrappedValidationError);
    });
  });

  describe('Design by Contract - Postconditions & Computations', () => {
    it('should aggregate empty data successfully', async () => {
      const result = await service.getYearlyWrapped(validUserId, targetYear);

      expect(result.userId).toBe(validUserId);
      expect(result.year).toBe(targetYear);
      expect(result.totalPlanted).toBe(0);
      expect(result.totalCompleted).toBe(0);
      expect(result.tierRatios).toEqual({ common: 0, uncommon: 0, rare: 0, mythical: 0 });
      expect(result.averageResilienceIndex).toBe(0);
      expect(result.guardianAngel).toBeNull();
      expect(result.socialEcho).toEqual({ commentCount: 0, reactionCount: 0, totalInteractions: 0 });
    });

    it('should aggregate total planted vs completed and tier ratios correctly', async () => {
      habitsData.push(
        {
          id: 'habit-1',
          user_id: validUserId,
          created_at: '2026-03-01T12:00:00Z',
          status: 'completed',
          completed_at: '2026-05-01T12:00:00Z',
          difficulty_tier: 'common',
          frequency: 'daily',
          wither_threshold: 3
        },
        {
          id: 'habit-2',
          user_id: validUserId,
          created_at: '2026-07-01T12:00:00Z',
          status: 'healthy',
          completed_at: null,
          difficulty_tier: 'rare',
          frequency: 'daily',
          wither_threshold: 3
        },
        {
          id: 'habit-3',
          user_id: validUserId,
          created_at: '2025-12-31T12:00:00Z', // Prev year
          status: 'completed',
          completed_at: '2026-01-15T12:00:00Z', // Completed this year
          difficulty_tier: 'mythical',
          frequency: 'daily',
          wither_threshold: 3
        }
      );

      const result = await service.getYearlyWrapped(validUserId, targetYear);

      expect(result.totalPlanted).toBe(2); // habit-1 and habit-2 (created in 2026)
      expect(result.totalCompleted).toBe(2); // habit-1 and habit-3 (completed in 2026)
      expect(result.tierRatios).toEqual({
        common: 1, // habit-1
        uncommon: 0,
        rare: 1, // habit-2
        mythical: 0 // habit-3 not counted in planted ratios for 2026
      });
    });

    it('should calculate average resilience index correctly based on withered gaps', async () => {
      // 1 habit created on Day 0
      // Logged at Day 2 (healthy)
      // Logged at Day 10 (withered: gap of 8 days, threshold is 3 days. Withered duration: 8 - 3 = 5 days)
      // Completed at Day 15 (healthy: gap of 5 days, threshold is 3 days. Withered duration: 5 - 3 = 2 days)
      // Total wither duration: 5 + 2 = 7 days. Episodes: 2. Average: 3.5 days.
      const createdAt = new Date('2026-01-01T00:00:00Z');
      const log1 = new Date('2026-01-03T00:00:00Z');
      const log2 = new Date('2026-01-11T00:00:00Z');
      const completedAt = new Date('2026-01-16T00:00:00Z');

      habitsData.push({
        id: validHabitId,
        user_id: validUserId,
        created_at: createdAt.toISOString(),
        status: 'completed',
        completed_at: completedAt.toISOString(),
        difficulty_tier: 'common',
        frequency: 'daily',
        wither_threshold: 3
      });

      logsData.push(
        { id: 'log-1', habit_id: validHabitId, completed_at: log1.toISOString() },
        { id: 'log-2', habit_id: validHabitId, completed_at: log2.toISOString() }
      );

      const result = await service.getYearlyWrapped(validUserId, targetYear);
      expect(result.averageResilienceIndex).toBe(3.5);
    });

    it('should resolve Guardian Angel correctly', async () => {
      // Setup nudges
      nudgesData.push(
        {
          id: 'nudge-1',
          sender_id: validFriendId,
          receiver_id: validUserId,
          habit_id: validHabitId,
          created_at: '2026-04-01T12:00:00Z'
        },
        {
          id: 'nudge-2',
          sender_id: validFriendId,
          receiver_id: validUserId,
          habit_id: validHabitId,
          created_at: '2026-05-01T12:00:00Z'
        },
        {
          id: 'nudge-3',
          sender_id: 'another-friend-id',
          receiver_id: validUserId,
          habit_id: validHabitId,
          created_at: '2026-05-02T12:00:00Z'
        }
      );

      // Setup profile
      const mockAngelProfile: Profile = {
        id: validFriendId,
        username: 'gardener_bob',
        display_name: 'Bob the Builder',
        avatar_url: 'bob_avatar.jpg',
        created_at: '2025-01-01T00:00:00Z'
      };
      profilesData.push(mockAngelProfile);

      const result = await service.getYearlyWrapped(validUserId, targetYear);

      expect(result.guardianAngel).not.toBeNull();
      expect(result.guardianAngel?.nudgeCount).toBe(2);
      expect(result.guardianAngel?.profile?.username).toBe('gardener_bob');
    });

    it('should aggregate Social Echo correctly, excluding self-interactions', async () => {
      habitsData.push({
        id: validHabitId,
        user_id: validUserId,
        created_at: '2026-01-01T00:00:00Z',
        status: 'healthy',
        difficulty_tier: 'common',
        frequency: 'daily',
        wither_threshold: 3
      });

      logsData.push({ id: validLogId, habit_id: validHabitId, completed_at: '2026-01-02T00:00:00Z' });

      commentsData.push(
        { id: 'comment-1', log_id: validLogId, user_id: validFriendId, content: 'Awesome!', created_at: '2026-01-02T01:00:00Z' },
        { id: 'comment-2', log_id: validLogId, user_id: validUserId, content: 'Thanks!', created_at: '2026-01-02T02:00:00Z' } // self comment
      );

      reactionsData.push(
        { id: 'reaction-1', log_id: validLogId, user_id: validFriendId, reaction_type: 'clap', created_at: '2026-01-02T01:05:00Z' },
        { id: 'reaction-2', log_id: validLogId, user_id: validUserId, reaction_type: 'heart', created_at: '2026-01-02T01:10:00Z' } // self reaction
      );

      const result = await service.getYearlyWrapped(validUserId, targetYear);

      expect(result.socialEcho.commentCount).toBe(1); // friend's comment only
      expect(result.socialEcho.reactionCount).toBe(1); // friend's reaction only
      expect(result.socialEcho.totalInteractions).toBe(2);
    });
  });

  describe('Database Error Handling', () => {
    it('should throw WrappedDatabaseError if habits query fails', async () => {
      queryBuilders['habits'] = new MockQueryBuilder(null, { message: 'Database error fetching habits' });

      await expect(service.getYearlyWrapped(validUserId, targetYear)).rejects.toThrow(WrappedDatabaseError);
    });
  });
});
