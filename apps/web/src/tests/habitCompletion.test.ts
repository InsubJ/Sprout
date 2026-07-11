// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { HabitService } from '../services/habitService';
import { LogService } from '../services/logService';
import { ReflectionService } from '../services/reflectionService';
import { useHabitLogs } from '../hooks/useHabitLogs';
import { Habit } from '../types/habit';
import { HabitLog } from '../types/habitLog';

function renderHook<TResult, TProps>(
  hookFn: (props: TProps) => TResult,
  initialProps: TProps
) {
  const result = { current: null as any as TResult };
  let updateProps: (newProps: TProps) => void = () => {};

  const TestComponent = ({ props }: { props: TProps }) => {
    const [p, setP] = React.useState(props);
    updateProps = setP;
    result.current = hookFn(p);
    return null;
  };

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(React.createElement(TestComponent, { props: initialProps }));
  });

  return {
    result,
    rerender: (newProps: TProps) => {
      act(() => {
        updateProps(newProps);
      });
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      document.body.removeChild(container);
    }
  };
}

describe('Habit Completion & State Machine Integration', () => {
  const validHabitId = '987f6543-e21b-34d5-c678-987654321000';
  const validUserId = '123e4567-e89b-12d3-a456-426614174000';

  const baseHabit: Habit = {
    id: validHabitId,
    user_id: validUserId,
    name: 'Meditate',
    description: '10 minutes daily',
    plant_type: 'Ethereal Sakura',
    difficulty_tier: 'mythical',
    frequency: 'daily',
    flexible_rules: null,
    target_waterings: 5,
    current_waterings: 4,
    wither_threshold: 1,
    consecutive_misses: 0,
    wither_count: 0,
    status: 'healthy',
    poetic_summary: null,
    is_public: true,
    current_streak: 4,
    max_streak: 4,
    completed_at: null,
    // 4.1 days ago so that Math.ceil(durationMs / 1 day) is exactly 5 days
    created_at: new Date(Date.now() - 4.1 * 24 * 60 * 60 * 1000).toISOString()
  };

  const mockLogs: HabitLog[] = [
    { id: '1', habit_id: validHabitId, user_id: validUserId, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '2', habit_id: validHabitId, user_id: validUserId, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '3', habit_id: validHabitId, user_id: validUserId, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '4', habit_id: validHabitId, user_id: validUserId, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '5', habit_id: validHabitId, user_id: validUserId, created_at: new Date().toISOString() }
  ];

  let mockSupabase: any;
  let habitService: HabitService;
  let reflectionService: ReflectionService;
  let mockLogService: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => Promise.resolve({ data: baseHabit, error: null }))
      }))
    };

    habitService = new HabitService(mockSupabase);
    reflectionService = new ReflectionService();
    mockLogService = {
      getLogsByHabitId: vi.fn().mockResolvedValue(mockLogs),
      getLogsByUserId: vi.fn(),
      createLog: vi.fn().mockResolvedValue({
        id: 'new-log-id',
        habit_id: validHabitId,
        user_id: validUserId,
        created_at: new Date().toISOString()
      })
    };

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('HabitService.checkAndCompleteHabit', () => {
    it('should do nothing if current_waterings is less than target_waterings', async () => {
      const incompleteHabit = { ...baseHabit, current_waterings: 3 };
      
      mockSupabase.from = vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: incompleteHabit, error: null })
      }));

      const spyUpdate = vi.spyOn(habitService, 'updateHabit');
      const result = await habitService.checkAndCompleteHabit(validHabitId, mockLogs, reflectionService);

      expect(spyUpdate).not.toHaveBeenCalled();
      expect(result).toEqual(incompleteHabit);
    });

    it('should generate summary and complete habit if target waterings is met', async () => {
      const matureHabit = { ...baseHabit, current_waterings: 5 }; // target is 5
      
      mockSupabase.from = vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: matureHabit, error: null })
      }));

      const spyUpdate = vi.spyOn(habitService, 'updateHabit').mockResolvedValue({
        ...matureHabit,
        status: 'completed',
        poetic_summary: 'Planted in hope...',
        completed_at: new Date().toISOString()
      });

      const result = await habitService.checkAndCompleteHabit(validHabitId, mockLogs, reflectionService);

      expect(spyUpdate).toHaveBeenCalledWith(validHabitId, expect.objectContaining({
        status: 'completed',
        poetic_summary: expect.stringContaining('devotion'),
        completed_at: expect.any(String)
      }));
      expect(result.status).toBe('completed');
      expect(result.poetic_summary).toBe('Planted in hope...');
    });

    it('should generate Flawless Bloom reflection category when conditions met', async () => {
      const matureHabit = { ...baseHabit, current_waterings: 5, wither_count: 0 };
      
      mockSupabase.from = vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: matureHabit, error: null })
      }));

      const spyUpdate = vi.spyOn(habitService, 'updateHabit').mockResolvedValue({
        ...matureHabit,
        status: 'completed',
        poetic_summary: 'Planted in hope...',
        completed_at: new Date().toISOString()
      });

      const spyGenerate = vi.spyOn(reflectionService, 'generateReflection');

      await habitService.checkAndCompleteHabit(validHabitId, mockLogs, reflectionService);

      expect(spyGenerate).toHaveBeenCalled();
      const generatedResult = spyGenerate.mock.results[0].value;
      expect(generatedResult.category).toBe('Flawless Bloom');
    });

    it('should generate Scarred Resilience reflection category when withered count is high', async () => {
      const matureHabit = { ...baseHabit, current_waterings: 5, wither_count: 4 };
      
      mockSupabase.from = vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: matureHabit, error: null })
      }));

      const spyUpdate = vi.spyOn(habitService, 'updateHabit').mockResolvedValue({
        ...matureHabit,
        status: 'completed',
        poetic_summary: 'Though the soil...',
        completed_at: new Date().toISOString()
      });

      const spyGenerate = vi.spyOn(reflectionService, 'generateReflection');

      await habitService.checkAndCompleteHabit(validHabitId, mockLogs, reflectionService);

      expect(spyGenerate).toHaveBeenCalled();
      const generatedResult = spyGenerate.mock.results[0].value;
      expect(generatedResult.category).toBe('Scarred Resilience');
    });
  });

  describe('Integration with useHabitLogs Hook', () => {
    it('should trigger completion check and completion transaction when watering reaches target', async () => {
      const matureHabit = { ...baseHabit, current_waterings: 5, status: 'completed' };
      
      mockSupabase.from = vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: matureHabit, error: null })
      }));

      const spyCheckComplete = vi.spyOn(habitService, 'checkAndCompleteHabit');

      let hook: any;
      await act(async () => {
        hook = renderHook(
          ({ habitId, userId }) => useHabitLogs(habitId, userId, mockLogService, habitService, reflectionService),
          { habitId: validHabitId, userId: validUserId }
        );
      });

      await act(async () => {
        await hook.result.current.waterHabit();
      });

      expect(mockLogService.createLog).toHaveBeenCalled();
      expect(mockLogService.getLogsByHabitId).toHaveBeenCalledWith(validHabitId);
      expect(spyCheckComplete).toHaveBeenCalledWith(validHabitId, expect.any(Array), reflectionService);
      hook.unmount();
    });
  });
});
