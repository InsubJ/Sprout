// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { HabitTimeline } from '../components/habit/HabitTimeline';
import { HabitLog } from '../types/habitLog';

describe('HabitTimeline Component', () => {
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
      root.render(React.createElement(HabitTimeline, props));
    });
  };

  it('renders correctly with default empty state', () => {
    renderComponent({ logs: [] });

    const timeline = document.querySelector('[data-testid="habit-timeline"]');
    const emptyState = document.querySelector('[data-testid="timeline-empty-state"]');
    const emptyIcon = document.querySelector('[data-testid="timeline-empty-icon"]');

    expect(timeline).toBeTruthy();
    expect(emptyState).toBeTruthy();
    expect(emptyState?.textContent).toContain('No check-in logs yet');
    expect(emptyIcon?.textContent).toBe('🌱');
  });

  it('renders habitName in header when provided', () => {
    renderComponent({ logs: [], habitName: 'Drink Water' });

    const header = document.querySelector('[data-testid="timeline-header"]');
    expect(header).toBeTruthy();
    expect(header?.textContent).toBe('Growth Timeline: Drink Water');
  });

  it('renders a list of logs sorted chronologically', () => {
    const mockLogs: HabitLog[] = [
      {
        id: 'log-2',
        habit_id: 'habit-123',
        user_id: 'user-456',
        note: 'Grew a tiny leaf!',
        image_url: 'https://example.com/leaf.jpg',
        created_at: '2026-07-08T12:00:00Z',
      },
      {
        id: 'log-1',
        habit_id: 'habit-123',
        user_id: 'user-456',
        note: 'Planted the seed',
        created_at: '2026-07-07T09:00:00Z',
      },
    ];

    renderComponent({ logs: mockLogs });

    const items = document.querySelectorAll('[data-testid="timeline-item"]');
    expect(items.length).toBe(2);

    // Verify chronological order (log-1 first, then log-2)
    const dates = document.querySelectorAll('[data-testid="timeline-item-date"]');
    const notes = document.querySelectorAll('[data-testid="timeline-item-note"]');

    // First item in DOM (oldest)
    expect(notes[0].textContent).toBe('Planted the seed');
    // Second item in DOM (newest)
    expect(notes[1].textContent).toBe('Grew a tiny leaf!');

    // Check optional image rendering
    const images = document.querySelectorAll('[data-testid="timeline-item-image"]');
    expect(images.length).toBe(1);
    expect((images[0] as HTMLImageElement).src).toBe('https://example.com/leaf.jpg');
  });

  it('calls onDeleteLog when delete button is clicked', () => {
    const mockOnDelete = vi.fn();
    const mockLogs: HabitLog[] = [
      {
        id: 'log-1',
        habit_id: 'habit-123',
        user_id: 'user-456',
        note: 'First checkin',
        created_at: '2026-07-07T09:00:00Z',
      },
    ];

    renderComponent({ logs: mockLogs, onDeleteLog: mockOnDelete });

    const deleteBtn = document.querySelector('[data-testid="delete-log-log-1"]') as HTMLButtonElement;
    expect(deleteBtn).toBeTruthy();

    act(() => {
      deleteBtn.click();
    });

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('log-1');
  });

  describe('Design by Contract (Preconditions)', () => {
    it('throws error if logs prop is not an array', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderComponent({ logs: null as any });
      }).toThrow('Precondition failed: logs must be a valid array');

      consoleSpy.mockRestore();
    });

    it('throws error if log entry is not an object', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderComponent({ logs: [null] as any });
      }).toThrow('Precondition failed: log must be an object');

      consoleSpy.mockRestore();
    });

    it('throws error if log entry is missing id', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderComponent({
          logs: [
            {
              habit_id: 'habit-123',
              user_id: 'user-456',
              created_at: '2026-07-07T09:00:00Z',
            } as any,
          ],
        });
      }).toThrow('Precondition failed: log must have a valid string id');

      consoleSpy.mockRestore();
    });

    it('throws error if log entry is missing created_at', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderComponent({
          logs: [
            {
              id: 'log-123',
              habit_id: 'habit-123',
              user_id: 'user-456',
            } as any,
          ],
        });
      }).toThrow('Precondition failed: log must have a valid string created_at');

      consoleSpy.mockRestore();
    });
  });
});