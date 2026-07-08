// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useHabitLogs } from '../hooks/useHabitLogs';
import { HabitLog } from '../types/habitLog';

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

describe('useHabitLogs Hook', () => {
  const validHabitId = '987f6543-e21b-34d5-c678-987654321000';
  const validUserId = '123e4567-e89b-12d3-a456-426614174000';

  const mockLog: HabitLog = {
    id: 'foo-log-uuid',
    habit_id: validHabitId,
    user_id: validUserId,
    created_at: new Date().toISOString(),
  };

  let mockService: any;

  beforeEach(() => {
    mockService = {
      getLogsByHabitId: vi.fn().mockResolvedValue([mockLog]),
      getLogsByUserId: vi.fn(),
      createLog: vi.fn(),
    };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Fetch behavior', () => {
    it('should auto-fetch logs on mount when valid IDs are provided', async () => {
      let hook: any;
      await act(async () => {
        hook = renderHook(
          ({ habitId, userId }) => useHabitLogs(habitId, userId, mockService),
          { habitId: validHabitId, userId: validUserId }
        );
      });

      expect(mockService.getLogsByHabitId).toHaveBeenCalledWith(validHabitId);
      expect(hook.result.current.loading).toBe(false);
      expect(hook.result.current.error).toBeNull();
      expect(hook.result.current.logs).toEqual([mockLog]);
      hook.unmount();
    });

    it('should set error and not fetch if habitId is not a valid UUID', async () => {
      let hook: any;
      await act(async () => {
        hook = renderHook(
          ({ habitId, userId }) => useHabitLogs(habitId, userId, mockService),
          { habitId: 'invalid-id', userId: validUserId }
        );
      });

      expect(mockService.getLogsByHabitId).not.toHaveBeenCalled();
      expect(hook.result.current.logs).toEqual([]);
      expect(hook.result.current.error).toBe('Habit ID must be a valid UUID');
      hook.unmount();
    });

    it('should set error state if fetch fails', async () => {
      mockService.getLogsByHabitId.mockRejectedValue(new Error('Fetch logs failed'));

      let hook: any;
      await act(async () => {
        hook = renderHook(
          ({ habitId, userId }) => useHabitLogs(habitId, userId, mockService),
          { habitId: validHabitId, userId: validUserId }
        );
      });

      expect(hook.result.current.error).toBe('Fetch logs failed');
      expect(hook.result.current.logs).toEqual([]);
      hook.unmount();
    });
  });

  describe('waterHabit action and throttling', () => {
    it('should successfully add a new check-in log and update state', async () => {
      const createdLog: HabitLog = {
        id: 'new-log-uuid',
        habit_id: validHabitId,
        user_id: validUserId,
        created_at: new Date().toISOString(),
      };
      mockService.createLog.mockResolvedValue(createdLog);

      let hook: any;
      await act(async () => {
        hook = renderHook(
          ({ habitId, userId }) => useHabitLogs(habitId, userId, mockService),
          { habitId: validHabitId, userId: validUserId }
        );
      });

      let returnedLog: HabitLog | null = null;
      await act(async () => {
        returnedLog = await hook.result.current.waterHabit();
      });

      expect(mockService.createLog).toHaveBeenCalledWith({ habit_id: validHabitId, user_id: validUserId });
      expect(returnedLog).toEqual(createdLog);
      expect(hook.result.current.logs).toEqual([createdLog, mockLog]);
      hook.unmount();
    });

    it('should throttle double-tap click within 1000ms', async () => {
      const createdLog1: HabitLog = {
        id: 'log-1',
        habit_id: validHabitId,
        user_id: validUserId,
        created_at: new Date().toISOString(),
      };
      mockService.createLog.mockResolvedValue(createdLog1);

      let hook: any;
      await act(async () => {
        hook = renderHook(
          ({ habitId, userId }) => useHabitLogs(habitId, userId, mockService),
          { habitId: validHabitId, userId: validUserId }
        );
      });

      // First water click
      await act(async () => {
        await hook.result.current.waterHabit();
      });
      expect(mockService.createLog).toHaveBeenCalledTimes(1);

      // Fast-forward 500ms
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Second click (within 1000ms) - should throw error and not call service
      let errorThrown: any = null;
      await act(async () => {
        try {
          await hook.result.current.waterHabit();
        } catch (err) {
          errorThrown = err;
        }
      });

      expect(errorThrown).toBeTruthy();
      expect(errorThrown.message).toBe('Watering is throttled');
      expect(mockService.createLog).toHaveBeenCalledTimes(1); // Still 1

      // Fast-forward another 600ms (total 1100ms since first click)
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Third click (more than 1000ms later) - should succeed
      const createdLog2: HabitLog = {
        id: 'log-2',
        habit_id: validHabitId,
        user_id: validUserId,
        created_at: new Date().toISOString(),
      };
      mockService.createLog.mockResolvedValue(createdLog2);

      await act(async () => {
        await hook.result.current.waterHabit();
      });

      expect(mockService.createLog).toHaveBeenCalledTimes(2);
      hook.unmount();
    });
  });
});
