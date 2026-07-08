// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { InteractionPanel } from '../components/social/InteractionPanel';
import * as useInteractionsHookModule from '../hooks/useInteractions';
import { LogComment, LogReaction } from '../types/interaction';
import { CommentWithProfile } from '../hooks/useInteractions';

describe('InteractionPanel Component', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  const validLogId = '11111111-1111-1111-1111-111111111111';
  const validUserId = '22222222-2222-2222-2222-222222222222';
  const otherUserId = '33333333-3333-3333-3333-333333333333';
  const commentId = '44444444-4444-4444-4444-444444444444';

  const mockComment: CommentWithProfile = {
    id: commentId,
    log_id: validLogId,
    user_id: validUserId,
    content: 'Awesome habit!',
    created_at: new Date().toISOString(),
    username: 'johndoe',
    display_name: 'John Doe',
  };

  const mockOtherComment: CommentWithProfile = {
    id: '55555555-5555-5555-5555-555555555555',
    log_id: validLogId,
    user_id: otherUserId,
    content: 'Keep it up!',
    created_at: new Date().toISOString(),
    username: 'janedoe',
    display_name: 'Jane Doe',
  };

  let mockHookResult: any;

  // Helper to change input values in React-controlled DOM elements
  const changeInputValue = (
    input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    value: string
  ) => {
    const prototype = Object.getPrototypeOf(input);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, value);
    } else {
      input.value = value;
    }
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    mockHookResult = {
      comments: [mockComment, mockOtherComment],
      reactions: [],
      loading: false,
      error: null,
      reactionCounts: {
        '💧': 2,
        '👍': 0,
        '❤️': 1,
        '🌟': 0,
      },
      userReactions: {
        '💧': true,
        '👍': false,
        '❤️': false,
        '🌟': false,
      },
      fetchInteractions: vi.fn(),
      toggleReaction: vi.fn(),
      addComment: vi.fn().mockResolvedValue({
        id: 'new-comment-id',
        log_id: validLogId,
        user_id: validUserId,
        content: 'New comment',
        created_at: new Date().toISOString(),
      }),
      deleteComment: vi.fn(),
    };

    vi.spyOn(useInteractionsHookModule, 'useInteractions').mockReturnValue(mockHookResult);
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

  const renderComponent = (props: any = {}) => {
    act(() => {
      root.render(
        React.createElement(InteractionPanel, {
          logId: validLogId,
          userId: validUserId,
          ...props,
        })
      );
    });
  };

  describe('Preconditions & Contracts', () => {
    it('throws error if logId is missing', () => {
      // Suppress console.error in tests for expected throws
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        renderComponent({ logId: undefined });
      }).toThrow('Log ID is required');
      consoleSpy.mockRestore();
    });

    it('throws error if logId is not a valid UUID', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        renderComponent({ logId: 'invalid-uuid' });
      }).toThrow('Log ID must be a valid UUID');
      consoleSpy.mockRestore();
    });

    it('throws error if userId is missing', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        renderComponent({ userId: undefined });
      }).toThrow('User ID is required');
      consoleSpy.mockRestore();
    });

    it('throws error if userId is not a valid UUID', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        renderComponent({ userId: 'invalid-uuid' });
      }).toThrow('User ID must be a valid UUID');
      consoleSpy.mockRestore();
    });
  });

  describe('Rendering', () => {
    it('renders reaction buttons with correct counts and active classes', () => {
      renderComponent();

      const waterButton = document.querySelector('[data-testid="reaction-btn-💧"]') as HTMLButtonElement;
      const likeButton = document.querySelector('[data-testid="reaction-btn-👍"]') as HTMLButtonElement;
      const starButton = document.querySelector('[data-testid="reaction-btn-🌟"]') as HTMLButtonElement;

      expect(waterButton).toBeTruthy();
      expect(likeButton).toBeTruthy();
      expect(starButton).toBeTruthy();

      // Counts
      const waterCount = document.querySelector('[data-testid="reaction-count-💧"]');
      const likeCount = document.querySelector('[data-testid="reaction-count-👍"]');
      expect(waterCount?.textContent).toBe('2');
      expect(likeCount).toBeNull(); // 0 counts should not render count badge

      // Active state class checking via style module patterns
      // Active state should have the active class
      expect(waterButton.className).toContain('activeReaction');
      expect(likeButton.className).not.toContain('activeReaction');
    });

    it('renders comments list with correct details', () => {
      renderComponent();

      const commentsSection = document.querySelector('[data-testid="comments-section"]');
      expect(commentsSection).toBeTruthy();

      const comment1 = document.querySelector(`[data-testid="comment-item-${commentId}"]`);
      expect(comment1).toBeTruthy();
      expect(comment1?.textContent).toContain('John Doe');
      expect(comment1?.textContent).toContain('@johndoe');
      expect(comment1?.textContent).toContain('Awesome habit!');

      // Check author delete button visibility
      const deleteBtn1 = document.querySelector(`[data-testid="delete-comment-btn-${commentId}"]`);
      const deleteBtn2 = document.querySelector('[data-testid="delete-comment-btn-55555555-5555-5555-5555-555555555555"]');
      
      expect(deleteBtn1).toBeTruthy(); // user_id matches validUserId
      expect(deleteBtn2).toBeNull();    // user_id matches otherUserId, so no delete btn
    });

    it('renders loading indicator when loading comments is true and comments are empty', () => {
      mockHookResult.loading = true;
      mockHookResult.comments = [];
      renderComponent();

      const loadingIndicator = document.querySelector('[data-testid="loading-indicator"]');
      expect(loadingIndicator).toBeTruthy();
      expect(loadingIndicator?.textContent).toContain('Loading comments...');
    });

    it('renders error message when hook returns error', () => {
      mockHookResult.error = 'Failed to load interactions';
      renderComponent();

      const errorDiv = document.querySelector('[data-testid="interaction-error"]');
      expect(errorDiv).toBeTruthy();
      expect(errorDiv?.textContent).toBe('Failed to load interactions');
    });
  });

  describe('Interactions', () => {
    it('calls toggleReaction when a reaction button is clicked', async () => {
      renderComponent();

      const waterButton = document.querySelector('[data-testid="reaction-btn-💧"]') as HTMLButtonElement;
      act(() => {
        waterButton.click();
      });

      expect(mockHookResult.toggleReaction).toHaveBeenCalledWith('💧');
    });

    it('calls addComment when form is submitted with non-empty text', async () => {
      renderComponent();

      const form = document.querySelector('[data-testid="comment-form"]') as HTMLFormElement;
      const input = document.querySelector('[data-testid="comment-input"]') as HTMLInputElement;

      act(() => {
        changeInputValue(input, 'Superb progress!');
      });

      expect(input.value).toBe('Superb progress!');

      await act(async () => {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      expect(mockHookResult.addComment).toHaveBeenCalledWith('Superb progress!');
      expect(input.value).toBe(''); // Form clears
    });

    it('disables submit button when comment input is blank', () => {
      renderComponent();

      const submitBtn = document.querySelector('[data-testid="comment-submit-btn"]') as HTMLButtonElement;
      const input = document.querySelector('[data-testid="comment-input"]') as HTMLInputElement;

      // Initially blank, should be disabled
      expect(submitBtn.disabled).toBe(true);

      act(() => {
        changeInputValue(input, '   ');
      });

      expect(submitBtn.disabled).toBe(true);

      act(() => {
        changeInputValue(input, 'Valid text');
      });

      expect(submitBtn.disabled).toBe(false);
    });

    it('calls deleteComment when comment delete button is clicked', () => {
      renderComponent();

      const deleteBtn = document.querySelector(`[data-testid="delete-comment-btn-${commentId}"]`) as HTMLButtonElement;
      act(() => {
        deleteBtn.click();
      });

      expect(mockHookResult.deleteComment).toHaveBeenCalledWith(commentId);
    });
  });
});
