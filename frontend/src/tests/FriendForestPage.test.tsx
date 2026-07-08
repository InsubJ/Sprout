// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import FriendForestPage from '../app/forest/[username]/page';
import * as useFriendForestHookModule from '../hooks/useFriendForest';
import { Profile } from '../types/profile';
import { Habit } from '../types/habit';
import { HabitLog } from '../types/habitLog';

describe('FriendForestPage Component & Hook', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  const currentUserId = '11111111-1111-1111-1111-111111111111';
  const friendUserId = '22222222-2222-2222-2222-222222222222';

  const mockFriendProfile: Profile = {
    id: friendUserId,
    username: 'alice',
    display_name: 'Alice Cooper',
    avatar_url: 'https://example.com/avatar.png',
    created_at: new Date().toISOString(),
  };

  const mockPublicHabit: Habit = {
    id: 'habit-1-uuid',
    user_id: friendUserId,
    name: 'Morning Meditation',
    description: '15 mins',
    plant_type: 'fern',
    difficulty_tier: 'common',
    frequency: 'daily',
    flexible_rules: null,
    target_waterings: 10,
    current_waterings: 5,
    wither_threshold: 3,
    consecutive_misses: 1,
    wither_count: 0,
    status: 'healthy',
    poetic_summary: null,
    is_public: true,
    current_streak: 5,
    max_streak: 7,
    completed_at: null,
    created_at: new Date().toISOString(),
  };

  const mockPrivateHabit: Habit = {
    id: 'habit-2-uuid',
    user_id: friendUserId,
    name: 'Secret diary writing',
    description: 'Private',
    plant_type: 'rose',
    difficulty_tier: 'rare',
    frequency: 'daily',
    flexible_rules: null,
    target_waterings: 5,
    current_waterings: 2,
    wither_threshold: 3,
    consecutive_misses: 0,
    wither_count: 0,
    status: 'completed',
    poetic_summary: null,
    is_public: false,
    current_streak: 5,
    max_streak: 5,
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const mockHabitLog: HabitLog = {
    id: 'log-1-uuid',
    habit_id: 'habit-1-uuid',
    user_id: friendUserId,
    note: 'Feeling great!',
    created_at: new Date().toISOString(),
  };

  let mockHookResult: any;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    mockHookResult = {
      friendProfile: mockFriendProfile,
      isMutuallyConnected: true,
      publicHabits: [mockPublicHabit],
      recentLogs: [mockHabitLog],
      activeProgress: {
        totalHabits: 1,
        healthyCount: 1,
        witheredCount: 0,
        completedCount: 0,
        totalWaterings: 10,
        currentWaterings: 5,
      },
      loading: false,
      error: null,
      fetchForestData: vi.fn(),
    };

    vi.spyOn(useFriendForestHookModule, 'useFriendForest').mockReturnValue(mockHookResult);
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

  describe('Design by Contract (Preconditions)', () => {
    it('throws error if username param is missing or empty', () => {
      expect(() => {
        renderComponent({
          params: { username: '' },
          searchParams: { currentUserId },
        });
      }).toThrow('Username parameter is required');
    });

    it('throws error if currentUserId searchParam is not a valid UUID', () => {
      expect(() => {
        renderComponent({
          params: { username: 'alice' },
          searchParams: { currentUserId: 'invalid-uuid' },
        });
      }).toThrow('Current User ID must be a valid UUID');
    });
  });

  describe('UI States', () => {
    it('renders loading spinner when loading is true', () => {
      mockHookResult.loading = true;
      mockHookResult.friendProfile = null;

      renderComponent({
        params: { username: 'alice' },
        searchParams: { currentUserId },
      });

      expect(document.querySelector('[data-testid="loading-indicator"]')).toBeTruthy();
      expect(document.querySelector('p')?.textContent).toBe('Walking into the forest...');
    });

    it('renders error block when error is present and profile is null', () => {
      mockHookResult.error = 'User @alice not found';
      mockHookResult.friendProfile = null;

      renderComponent({
        params: { username: 'alice' },
        searchParams: { currentUserId },
      });

      expect(document.querySelector('[data-testid="error-container"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="error-container"]')?.textContent).toContain('User @alice not found');
    });
  });

  describe('Connection Validation Warnings', () => {
    it('shows connection required warning if not mutually connected', () => {
      mockHookResult.isMutuallyConnected = false;
      mockHookResult.publicHabits = [];
      mockHookResult.recentLogs = [];

      renderComponent({
        params: { username: 'alice' },
        searchParams: { currentUserId },
      });

      // Verify connection badge status
      const badge = document.querySelector('[data-testid="connection-status"]');
      expect(badge?.textContent).toBe('🔒 Mutual Connection Required');

      // Verify warning block is displayed
      const warning = document.querySelector('[data-testid="connection-warning"]');
      expect(warning).toBeTruthy();
      expect(document.querySelector('[data-testid="warning-title"]')?.textContent).toBe('Connection Required');
      expect(document.querySelector('[data-testid="warning-description"]')?.textContent).toContain(
        'You must be mutually connected with @alice to see their forest trees'
      );

      // Verify private contents are hidden
      expect(document.querySelector('[data-testid="trees-section"]')).toBeNull();
      expect(document.querySelector('[data-testid="activities-section"]')).toBeNull();
    });
  });

  describe('Connected Forest Content Rendering', () => {
    it('renders stats overview and public trees correctly when connected', () => {
      renderComponent({
        params: { username: 'alice' },
        searchParams: { currentUserId },
      });

      // Connection status should show connected
      const badge = document.querySelector('[data-testid="connection-status"]');
      expect(badge?.textContent).toBe('🟢 Connected');

      // Header display name & username
      expect(document.querySelector('[data-testid="profile-display-name"]')?.textContent).toBe('Alice Cooper');
      expect(document.querySelector('[data-testid="profile-username"]')?.textContent).toBe('@alice');

      // Stats checking
      expect(document.querySelector('[data-testid="stat-total-habits"]')?.textContent).toBe('1');
      expect(document.querySelector('[data-testid="stat-healthy"]')?.textContent).toBe('1');
      expect(document.querySelector('[data-testid="stat-withered"]')?.textContent).toBe('0');
      expect(document.querySelector('[data-testid="stat-completed"]')?.textContent).toBe('0');

      // Habits grid should have one tree
      expect(document.querySelector('[data-testid="habits-grid"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="habit-name"]')?.textContent).toBe('Morning Meditation');
    });

    it('renders recent watering activities list when logs exist', () => {
      renderComponent({
        params: { username: 'alice' },
        searchParams: { currentUserId },
      });

      const list = document.querySelector('[data-testid="activity-list"]');
      expect(list).toBeTruthy();

      const items = document.querySelectorAll('[data-testid="activity-item"]');
      expect(items.length).toBe(1);
      expect(document.querySelector('[data-testid="activity-item"]')?.textContent).toContain('Watered Morning Meditation');
      expect(document.querySelector('[data-testid="activity-note"]')?.textContent).toBe('“Feeling great!”');
    });

    it('renders empty forest message if friend has no public habits', () => {
      mockHookResult.publicHabits = [];
      mockHookResult.activeProgress = {
        totalHabits: 0,
        healthyCount: 0,
        witheredCount: 0,
        completedCount: 0,
        totalWaterings: 0,
        currentWaterings: 0,
      };

      renderComponent({
        params: { username: 'alice' },
        searchParams: { currentUserId },
      });

      expect(document.querySelector('[data-testid="empty-trees-state"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="empty-trees-state"]')?.textContent).toContain(
        'This forest has no public trees planted yet.'
      );
    });

    it('renders empty activities message if friend has no recent watering activity', () => {
      mockHookResult.recentLogs = [];

      renderComponent({
        params: { username: 'alice' },
        searchParams: { currentUserId },
      });

      expect(document.querySelector('[data-testid="empty-activities-state"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="empty-activities-state"]')?.textContent).toContain(
        'No recent watering activity recorded.'
      );
    });
  });
});
