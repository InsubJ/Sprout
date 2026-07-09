// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

vi.mock('../components/common/AppProviders', () => ({
  useAuth: () => ({
    currentUser: { id: '11111111-1111-1111-1111-111111111111', username: 'bob' },
    login: vi.fn(),
    logout: vi.fn(),
    isMockMode: true,
    updateCurrentUser: vi.fn(),
  }),
}));

import FriendForestPage from '../app/forest/[username]/page';
import * as useFriendForestHookModule from '../hooks/useFriendForest';
import { useWitherNudge } from '../hooks/useWitherNudge';
import { Profile } from '../types/profile';
import { Habit } from '../types/habit';
import { WitherNudge } from '../types/nudge';

describe('WitherNudge System & UI Tests', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  const currentUserId = '11111111-1111-1111-1111-111111111111';
  const friendUserId = '22222222-2222-2222-2222-222222222222';
  const mockWitheredHabitId = '33333333-3333-3333-3333-333333333333';
  const mockHealthyHabitId = '44444444-4444-4444-4444-444444444444';

  const mockFriendProfile: Profile = {
    id: friendUserId,
    username: 'alice',
    display_name: 'Alice Cooper',
    avatar_url: 'https://example.com/avatar.png',
    created_at: new Date().toISOString(),
  };

  const mockWitheredHabit: Habit = {
    id: mockWitheredHabitId,
    user_id: friendUserId,
    name: 'Morning Gym Session',
    description: '30 mins workout',
    plant_type: 'fern',
    difficulty_tier: 'common',
    frequency: 'daily',
    flexible_rules: null,
    target_waterings: 10,
    current_waterings: 5,
    wither_threshold: 3,
    consecutive_misses: 4,
    wither_count: 1,
    status: 'withered',
    poetic_summary: null,
    is_public: true,
    current_streak: 0,
    max_streak: 5,
    completed_at: null,
    created_at: new Date().toISOString(),
  };

  const mockHealthyHabit: Habit = {
    id: mockHealthyHabitId,
    user_id: friendUserId,
    name: 'Drink Water',
    description: '2L',
    plant_type: 'cactus',
    difficulty_tier: 'common',
    frequency: 'daily',
    flexible_rules: null,
    target_waterings: 5,
    current_waterings: 2,
    wither_threshold: 3,
    consecutive_misses: 0,
    wither_count: 0,
    status: 'healthy',
    poetic_summary: null,
    is_public: true,
    current_streak: 2,
    max_streak: 3,
    completed_at: null,
    created_at: new Date().toISOString(),
  };

  let mockHookResult: any;
  let mockNudgeService: any;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    mockHookResult = {
      friendProfile: mockFriendProfile,
      isMutuallyConnected: true,
      publicHabits: [mockWitheredHabit, mockHealthyHabit],
      recentLogs: [],
      activeProgress: {
        totalHabits: 2,
        healthyCount: 1,
        witheredCount: 1,
        completedCount: 0,
        totalWaterings: 15,
        currentWaterings: 7,
      },
      loading: false,
      error: null,
      fetchForestData: vi.fn(),
    };

    vi.spyOn(useFriendForestHookModule, 'useFriendForest').mockReturnValue(mockHookResult);

    mockNudgeService = {
      sendNudge: vi.fn().mockImplementation((input) => {
        return Promise.resolve({
          id: '22222222-2222-2222-2222-222222222222',
          sender_id: input.sender_id,
          receiver_id: input.receiver_id,
          habit_id: input.habit_id,
          nudged_at: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        } as WitherNudge);
      }),
      hasUserNudgedToday: vi.fn().mockResolvedValue(false),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    if (container) {
      document.body.removeChild(container);
    }
    container = null;
    root = null;
  });

  const renderComponent = (props: any) => {
    act(() => {
      root.render(React.createElement(FriendForestPage, props));
    });
  };

  describe('Nudge Button Visibility', () => {
    it('renders nudge button for withered habits on visitor profile', async () => {
      await act(async () => {
        renderComponent({
          params: { username: 'alice' },
          searchParams: { currentUserId },
          customNudgeService: mockNudgeService,
        });
      });

      // Verify that hasUserNudgedToday was called for the withered habit
      expect(mockNudgeService.hasUserNudgedToday).toHaveBeenCalledWith(currentUserId, mockWitheredHabit.id);

      // Verify Nudge button is rendered on the withered habit card
      const nudgeBtn = document.querySelector('[data-testid="nudge-button"]');
      expect(nudgeBtn).toBeTruthy();
      expect(nudgeBtn?.textContent).toBe('Nudge');

      // Verify Water button is NOT rendered on the withered habit card
      const waterBtns = document.querySelectorAll('[data-testid="water-button"]');
      expect(waterBtns.length).toBe(0);
    });

    it('does not render nudge button for healthy habits', async () => {
      await act(async () => {
        renderComponent({
          params: { username: 'alice' },
          searchParams: { currentUserId },
          customNudgeService: mockNudgeService,
        });
      });

      // There should only be one nudge button overall (for the withered habit)
      const nudgeBtns = document.querySelectorAll('[data-testid="nudge-button"]');
      expect(nudgeBtns.length).toBe(1);
    });

    it('does not render nudge button when viewing own profile', async () => {
      // Modify hook mock to show the current user is the owner
      mockHookResult.friendProfile = { ...mockFriendProfile, id: currentUserId };

      await act(async () => {
        renderComponent({
          params: { username: 'alice' },
          searchParams: { currentUserId },
          customNudgeService: mockNudgeService,
        });
      });

      const nudgeBtn = document.querySelector('[data-testid="nudge-button"]');
      expect(nudgeBtn).toBeNull();
    });
  });

  describe('Nudge Click & Duplicate Prevention Behavior', () => {
    it('triggers sendNudge on click and transitions to Nudged state', async () => {
      await act(async () => {
        renderComponent({
          params: { username: 'alice' },
          searchParams: { currentUserId },
          customNudgeService: mockNudgeService,
        });
      });

      const nudgeBtn: any = document.querySelector('[data-testid="nudge-button"]');
      expect(nudgeBtn).toBeTruthy();
      expect(nudgeBtn.disabled).toBe(false);

      // Click the nudge button
      await act(async () => {
        nudgeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      // Verify nudge service was called
      expect(mockNudgeService.sendNudge).toHaveBeenCalledWith({
        sender_id: currentUserId,
        receiver_id: friendUserId,
        habit_id: mockWitheredHabit.id,
      });

      // Verify button status transitions to disabled and says "Nudged"
      expect(nudgeBtn.disabled).toBe(true);
      expect(nudgeBtn.textContent).toBe('Nudged');
    });

    it('renders button as disabled from start if already nudged today', async () => {
      // Simulate that the user already nudged the habit today
      mockNudgeService.hasUserNudgedToday.mockResolvedValue(true);

      await act(async () => {
        renderComponent({
          params: { username: 'alice' },
          searchParams: { currentUserId },
          customNudgeService: mockNudgeService,
        });
      });

      const nudgeBtn: any = document.querySelector('[data-testid="nudge-button"]');
      expect(nudgeBtn).toBeTruthy();
      expect(nudgeBtn.disabled).toBe(true);
      expect(nudgeBtn.textContent).toBe('Nudged');
    });
  });

  describe('useWitherNudge Hook (Design by Contract)', () => {
    const TestComponent = ({
      senderId,
      receiverId,
      habitId,
      nudgeService,
      onReady,
    }: {
      senderId: string;
      receiverId: any;
      habitId: string;
      nudgeService: any;
      onReady: (hookData: any) => void;
    }) => {
      const hookData = useWitherNudge(senderId, receiverId, nudgeService);
      useEffect(() => {
        onReady(hookData);
      }, [hookData, onReady]);
      return null;
    };

    it('throws error if senderId is missing or not a valid UUID', () => {
      expect(() => {
        renderComponent({
          params: { username: 'alice' },
          searchParams: { currentUserId: 'invalid-uuid' },
          customNudgeService: mockNudgeService,
        });
      }).toThrow('Current User ID must be a valid UUID');
    });

    it('throws error when sendNudge is called and sender and receiver are the same user', async () => {
      let hookResult: any = null;
      act(() => {
        root.render(
          React.createElement(TestComponent, {
            senderId: currentUserId,
            receiverId: currentUserId,
            habitId: mockWitheredHabit.id,
            nudgeService: mockNudgeService,
            onReady: (data) => { hookResult = data; },
          })
        );
      });

      expect(hookResult).toBeTruthy();
      await expect(hookResult.sendNudge(mockWitheredHabit.id)).rejects.toThrow('Sender and receiver cannot be the same user');
    });

    it('throws error in hook if receiverId is not a valid UUID', () => {
      expect(() => {
        act(() => {
          root.render(
            React.createElement(TestComponent, {
              senderId: currentUserId,
              receiverId: 'invalid-uuid',
              habitId: mockWitheredHabit.id,
              nudgeService: mockNudgeService,
              onReady: () => {},
            })
          );
        });
      }).toThrow('Receiver ID must be a valid UUID');
    });
  });
});
