// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useHabits } from '../hooks/useHabits';
import { HabitService } from '../services/habitService';
import { Habit, CreateHabitInput, UpdateHabitInput } from '../types/habit';

// Manual renderHook implementation for testing React hooks in a DOM environment
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

describe('useHabits Hook', () => {
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

  let mockService: any;

  beforeEach(() => {
    mockService = {
      getHabits: vi.fn().mockResolvedValue([mockHabit]),
      createHabit: vi.fn(),
      updateHabit: vi.fn(),
      deleteHabit: vi.fn(),
    };
  });

  describe('Initial Fetch behavior', () => {
    it('should auto-fetch habits on mount when valid userId is provided', async () => {
      let hook: any;
      await act(async () => {
        hook = renderHook(({ userId }) => useHabits(userId, mockService), { userId: validUserId });
      });

      expect(mockService.getHabits).toHaveBeenCalledWith(validUserId);
      expect(hook.result.current.loading).toBe(false);
      expect(hook.result.current.error).toBeNull();
      expect(hook.result.current.habits).toEqual([mockHabit]);
      hook.unmount();
    });

    it('should set error and not fetch if userId is not a valid UUID', async () => {
      let hook: any;
      await act(async () => {
        hook = renderHook(({ userId }) => useHabits(userId, mockService), { userId: 'invalid-id' });
      });

      expect(mockService.getHabits).not.toHaveBeenCalled();
      expect(hook.result.current.habits).toEqual([]);
      expect(hook.result.current.error).toBe('User ID must be a valid UUID');
      hook.unmount();
    });

    it('should set error state if fetch fails', async () => {
      mockService.getHabits.mockRejectedValue(new Error('Fetch failed'));

      let hook: any;
      await act(async () => {
        hook = renderHook(({ userId }) => useHabits(userId, mockService), { userId: validUserId });
      });

      expect(hook.result.current.error).toBe('Fetch failed');
      expect(hook.result.current.habits).toEqual([]);
      hook.unmount();
    });
  });

  describe('addHabit mutation', () => {
    it('should successfully add a new habit and update state', async () => {
      const input: CreateHabitInput = {
        user_id: validUserId,
        name: 'Drink Water'
      };
      const createdHabit: Habit = {
        ...mockHabit,
        id: 'new-habit-uuid',
        name: 'Drink Water'
      };
      mockService.createHabit.mockResolvedValue(createdHabit);

      let hook: any;
      await act(async () => {
        hook = renderHook(({ userId }) => useHabits(userId, mockService), { userId: validUserId });
      });

      let returnedHabit: Habit | null = null;
      await act(async () => {
        returnedHabit = await hook.result.current.addHabit(input);
      });

      expect(mockService.createHabit).toHaveBeenCalledWith(input);
      expect(returnedHabit).toEqual(createdHabit);
      // Verify cached habits list has the new habit prepended
      expect(hook.result.current.habits).toEqual([createdHabit, mockHabit]);
      hook.unmount();
    });

    it('should throw error and set error state if creation fails', async () => {
      const input: CreateHabitInput = {
        user_id: validUserId,
        name: 'Drink Water'
      };
      mockService.createHabit.mockRejectedValue(new Error('Creation failed'));

      let hook: any;
      await act(async () => {
        hook = renderHook(({ userId }) => useHabits(userId, mockService), { userId: validUserId });
      });

      let errorThrown: any = null;
      await act(async () => {
        try {
          await hook.result.current.addHabit(input);
        } catch (e) {
          errorThrown = e;
        }
      });

      expect(errorThrown).toBeTruthy();
      expect(errorThrown.message).toBe('Creation failed');
      expect(hook.result.current.error).toBe('Creation failed');
      // habits remains unchanged
      expect(hook.result.current.habits).toEqual([mockHabit]);
      hook.unmount();
    });

    it('should validate user_id precondition when calling addHabit', async () => {
      let hook: any;
      await act(async () => {
        hook = renderHook(({ userId }) => useHabits(userId, mockService), { userId: validUserId });
      });

      // User ID mismatch
      let errorThrown: any = null;
      await act(async () => {
        try {
          await hook.result.current.addHabit({ user_id: 'other-user-uuid', name: 'Exercise' });
        } catch (e) {
          errorThrown = e;
        }
      });

      expect(errorThrown).toBeTruthy();
      expect(errorThrown.message).toBe('User ID in input must match hook User ID');
      hook.unmount();
    });
  });

  describe('editHabit mutation', () => {
    it('should update the habit in the state cache', async () => {
      const updateInput: UpdateHabitInput = {
        name: 'Read 20 pages'
      };
      const updatedHabit: Habit = {
        ...mockHabit,
        name: 'Read 20 pages'
      };
      mockService.updateHabit.mockResolvedValue(updatedHabit);

      let hook: any;
      await act(async () => {
        hook = renderHook(({ userId }) => useHabits(userId, mockService), { userId: validUserId });
      });

      let returned: Habit | null = null;
      await act(async () => {
        returned = await hook.result.current.editHabit(validHabitId, updateInput);
      });

      expect(mockService.updateHabit).toHaveBeenCalledWith(validHabitId, updateInput);
      expect(returned).toEqual(updatedHabit);
      expect(hook.result.current.habits).toEqual([updatedHabit]);
      hook.unmount();
    });

    it('should validate habitId precondition', async () => {
      let hook: any;
      await act(async () => {
        hook = renderHook(({ userId }) => useHabits(userId, mockService), { userId: validUserId });
      });

      let errorThrown: any = null;
      await act(async () => {
        try {
          await hook.result.current.editHabit('invalid-uuid', { name: 'New Name' });
        } catch (e) {
          errorThrown = e;
        }
      });

      expect(errorThrown).toBeTruthy();
      expect(errorThrown.message).toBe('Habit ID must be a valid UUID');
      hook.unmount();
    });
  });

  describe('removeHabit mutation', () => {
    it('should remove the habit from the state cache', async () => {
      mockService.deleteHabit.mockResolvedValue(undefined);

      let hook: any;
      await act(async () => {
        hook = renderHook(({ userId }) => useHabits(userId, mockService), { userId: validUserId });
      });

      await act(async () => {
        await hook.result.current.removeHabit(validHabitId);
      });

      expect(mockService.deleteHabit).toHaveBeenCalledWith(validHabitId);
      expect(hook.result.current.habits).toEqual([]);
      hook.unmount();
    });

    it('should validate habitId precondition', async () => {
      let hook: any;
      await act(async () => {
        hook = renderHook(({ userId }) => useHabits(userId, mockService), { userId: validUserId });
      });

      let errorThrown: any = null;
      await act(async () => {
        try {
          await hook.result.current.removeHabit('invalid-uuid');
        } catch (e) {
          errorThrown = e;
        }
      });

      expect(errorThrown).toBeTruthy();
      expect(errorThrown.message).toBe('Habit ID must be a valid UUID');
      hook.unmount();
    });
  });
});
