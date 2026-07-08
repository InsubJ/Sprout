// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { HabitCard } from '../components/habit/HabitCard';

describe('HabitCard Component', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
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
      root.render(React.createElement(HabitCard, props));
    });
  };

  it('renders all basic details correctly', () => {
    renderComponent({
      name: 'Drink Water',
      frequency: 'daily',
      status: 'healthy',
      currentStreak: 5,
      currentWaterings: 15,
      targetWaterings: 30,
      plantType: 'Pothos',
      difficultyTier: 'common',
    });

    const card = document.querySelector('[data-testid="habit-card"]');
    const name = document.querySelector('[data-testid="habit-name"]');
    const frequency = document.querySelector('[data-testid="habit-frequency"]');
    const tier = document.querySelector('[data-testid="habit-tier"]');
    const plantType = document.querySelector('[data-testid="plant-type"]');
    const progressText = document.querySelector('[data-testid="progress-text"]');
    const streak = document.querySelector('[data-testid="habit-streak"]');

    expect(card).toBeTruthy();
    expect(name?.textContent).toBe('Drink Water');
    expect(frequency?.textContent).toBe('Daily');
    expect(tier?.textContent).toBe('common');
    expect(plantType?.textContent).toBe('Pothos');
    expect(progressText?.textContent).toBe('15 / 30 (50%)');
    expect(streak?.textContent).toContain('5');
  });

  it('renders the correct status badge depending on status prop', () => {
    // 1. Healthy status
    renderComponent({
      name: 'Exercise',
      frequency: 'weekly',
      status: 'healthy',
      currentStreak: 2,
      currentWaterings: 5,
      targetWaterings: 10,
    });
    expect(document.querySelector('[data-testid="status-healthy"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="status-healthy"]')?.textContent).toContain('Healthy');

    // 2. Withered status
    renderComponent({
      name: 'Exercise',
      frequency: 'weekly',
      status: 'withered',
      currentStreak: 0,
      currentWaterings: 5,
      targetWaterings: 10,
    });
    expect(document.querySelector('[data-testid="status-withered"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="status-withered"]')?.textContent).toContain('Withered');

    // 3. Completed status
    renderComponent({
      name: 'Exercise',
      frequency: 'weekly',
      status: 'completed',
      currentStreak: 10,
      currentWaterings: 10,
      targetWaterings: 10,
    });
    expect(document.querySelector('[data-testid="status-completed"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="status-completed"]')?.textContent).toContain('Completed');
  });

  it('renders consistency dots correctly based on consecutiveMisses and witherThreshold', () => {
    // With witherThreshold = 3, consecutiveMisses = 1
    // Expected: 2 hydrated dots (green/blue), 1 dehydrated dot (gray)
    renderComponent({
      name: 'Meditation',
      frequency: 'daily',
      status: 'healthy',
      currentStreak: 3,
      currentWaterings: 8,
      targetWaterings: 20,
      witherThreshold: 3,
      consecutiveMisses: 1,
    });

    const hydratedDots = document.querySelectorAll('[data-testid="dot-hydrated"]');
    const dehydratedDots = document.querySelectorAll('[data-testid="dot-dehydrated"]');

    expect(hydratedDots.length).toBe(2);
    expect(dehydratedDots.length).toBe(1);
  });

  it('hides consistency dots when habit status is completed', () => {
    renderComponent({
      name: 'Meditation',
      frequency: 'daily',
      status: 'completed',
      currentStreak: 20,
      currentWaterings: 20,
      targetWaterings: 20,
      witherThreshold: 3,
      consecutiveMisses: 0,
    });

    const indicator = document.querySelector('[data-testid="consistency-indicator"]');
    expect(indicator).toBeNull();
  });

  it('handles custom witherThreshold and active/dehydrated dots correctly', () => {
    renderComponent({
      name: 'Reading',
      frequency: 'daily',
      status: 'healthy',
      currentStreak: 0,
      currentWaterings: 2,
      targetWaterings: 5,
      witherThreshold: 5,
      consecutiveMisses: 4,
    });

    const hydratedDots = document.querySelectorAll('[data-testid="dot-hydrated"]');
    const dehydratedDots = document.querySelectorAll('[data-testid="dot-dehydrated"]');

    expect(hydratedDots.length).toBe(1);
    expect(dehydratedDots.length).toBe(4);
  });

  it('calls onWater callback when Water button is clicked', () => {
    const onWaterMock = vi.fn();
    renderComponent({
      name: 'Gym',
      frequency: 'flexible',
      status: 'healthy',
      currentStreak: 4,
      currentWaterings: 12,
      targetWaterings: 24,
      onWater: onWaterMock,
    });

    const waterBtn = document.querySelector('[data-testid="water-button"]') as HTMLButtonElement;
    expect(waterBtn).toBeTruthy();

    act(() => {
      waterBtn.click();
    });

    expect(onWaterMock).toHaveBeenCalledTimes(1);
  });

  it('does not render water button and displays completed message when completed', () => {
    const onWaterMock = vi.fn();
    renderComponent({
      name: 'Gym',
      frequency: 'flexible',
      status: 'completed',
      currentStreak: 24,
      currentWaterings: 24,
      targetWaterings: 24,
      onWater: onWaterMock,
    });

    const waterBtn = document.querySelector('[data-testid="water-button"]');
    const completedMsg = document.querySelector('[data-testid="completed-msg"]');

    expect(waterBtn).toBeNull();
    expect(completedMsg).toBeTruthy();
    expect(completedMsg?.textContent).toContain('Fully Grown');
  });

  describe('Design by Contract (Preconditions)', () => {
    it('throws error if habit name is empty or whitespace', () => {
      expect(() => {
        HabitCard({
          name: '   ',
          frequency: 'daily',
          status: 'healthy',
          currentStreak: 0,
          currentWaterings: 0,
          targetWaterings: 10,
        });
      }).toThrow('Habit name cannot be empty');
    });

    it('throws error if targetWaterings is non-positive', () => {
      expect(() => {
        HabitCard({
          name: 'Valid Name',
          frequency: 'daily',
          status: 'healthy',
          currentStreak: 0,
          currentWaterings: 0,
          targetWaterings: 0,
        });
      }).toThrow('Target waterings must be a positive integer');

      expect(() => {
        HabitCard({
          name: 'Valid Name',
          frequency: 'daily',
          status: 'healthy',
          currentStreak: 0,
          currentWaterings: 0,
          targetWaterings: -5,
        });
      }).toThrow('Target waterings must be a positive integer');
    });

    it('throws error if currentWaterings is negative', () => {
      expect(() => {
        HabitCard({
          name: 'Valid Name',
          frequency: 'daily',
          status: 'healthy',
          currentStreak: 0,
          currentWaterings: -1,
          targetWaterings: 10,
        });
      }).toThrow('Current waterings cannot be negative');
    });

    it('throws error if witherThreshold is non-positive', () => {
      expect(() => {
        HabitCard({
          name: 'Valid Name',
          frequency: 'daily',
          status: 'healthy',
          currentStreak: 0,
          currentWaterings: 0,
          targetWaterings: 10,
          witherThreshold: 0,
        });
      }).toThrow('Wither threshold must be a positive integer');
    });

    it('throws error if consecutiveMisses is negative', () => {
      expect(() => {
        HabitCard({
          name: 'Valid Name',
          frequency: 'daily',
          status: 'healthy',
          currentStreak: 0,
          currentWaterings: 0,
          targetWaterings: 10,
          consecutiveMisses: -3,
        });
      }).toThrow('Consecutive misses cannot be negative');
    });
  });
});
