// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { FriendsManager } from '../components/social/FriendsManager';
import * as useFriendshipsHookModule from '../hooks/useFriendships';
import { Profile } from '../types/profile';
import { FriendWithProfile } from '../hooks/useFriendships';

describe('FriendsManager Component', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  const validUserId = '11111111-1111-1111-1111-111111111111';
  const otherUserId = '22222222-2222-2222-2222-222222222222';
  const thirdUserId = '33333333-3333-3333-3333-333333333333';
  const friendshipId = '99999999-9999-9999-9999-999999999999';

  const mockProfile: Profile = {
    id: otherUserId,
    username: 'alice',
    display_name: 'Alice Smith',
    avatar_url: null,
    created_at: new Date().toISOString()
  };

  const mockSearchProfile: Profile = {
    id: thirdUserId,
    username: 'bob',
    display_name: 'Bob Jones',
    avatar_url: null,
    created_at: new Date().toISOString()
  };

  const mockFriend: FriendWithProfile = {
    friendshipId,
    profile: mockProfile,
    status: 'accepted'
  };

  const mockInvite: FriendWithProfile = {
    friendshipId,
    profile: mockProfile,
    status: 'pending'
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
      friends: [mockFriend],
      pendingRequests: [mockInvite],
      searchResults: [mockSearchProfile],
      loading: false,
      error: null,
      fetchFriendships: vi.fn(),
      sendRequest: vi.fn().mockResolvedValue({ id: friendshipId, user_id: validUserId, friend_id: thirdUserId, status: 'pending', created_at: '' }),
      acceptRequest: vi.fn().mockResolvedValue({ id: friendshipId, user_id: otherUserId, friend_id: validUserId, status: 'accepted', created_at: '' }),
      declineRequest: vi.fn().mockResolvedValue({ id: friendshipId, user_id: otherUserId, friend_id: validUserId, status: 'declined', created_at: '' }),
      searchUsers: vi.fn(),
      clearSearchResults: vi.fn()
    };

    vi.spyOn(useFriendshipsHookModule, 'useFriendships').mockReturnValue(mockHookResult);
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
      root.render(React.createElement(FriendsManager, props));
    });
  };

  describe('Design by Contract (Preconditions)', () => {
    it('throws error if userId is missing', () => {
      expect(() => {
        FriendsManager({ userId: '' });
      }).toThrow('User ID is required');
    });

    it('throws error if userId is not a valid UUID', () => {
      expect(() => {
        FriendsManager({ userId: 'invalid-uuid' });
      }).toThrow('User ID must be a valid UUID');
    });
  });

  describe('UI Rendering & Navigation', () => {
    it('renders basic layout and title correctly', () => {
      renderComponent({ userId: validUserId });
      expect(document.querySelector('[data-testid="friends-manager"]')).toBeTruthy();
      expect(document.querySelector('h1')?.textContent).toBe('Sprout Social');
    });

    it('renders friends list by default', () => {
      renderComponent({ userId: validUserId });
      const friendsList = document.querySelector('[data-testid="friends-list"]');
      expect(friendsList).toBeTruthy();
      const friendItems = document.querySelectorAll('[data-testid="friend-item"]');
      expect(friendItems.length).toBe(1);
      expect(document.querySelector('[data-testid="friend-display-name"]')?.textContent).toBe('Alice Smith');
    });

    it('displays invites count badge correctly', () => {
      renderComponent({ userId: validUserId });
      const badge = document.querySelector('[data-testid="invites-count"]');
      expect(badge?.textContent).toBe('1');
    });

    it('navigates tabs and displays invites when clicking Invites tab', () => {
      renderComponent({ userId: validUserId });
      const invitesTab = document.querySelector('[data-testid="tab-invites"]') as HTMLButtonElement;
      
      act(() => {
        invitesTab.click();
      });

      const invitesList = document.querySelector('[data-testid="invites-list"]');
      expect(invitesList).toBeTruthy();
      const inviteItems = document.querySelectorAll('[data-testid="invite-item"]');
      expect(inviteItems.length).toBe(1);
    });

    it('navigates to Find Friends tab and shows search form', () => {
      renderComponent({ userId: validUserId });
      const searchTab = document.querySelector('[data-testid="tab-search"]') as HTMLButtonElement;

      act(() => {
        searchTab.click();
      });

      expect(document.querySelector('[data-testid="search-input"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="search-button"]')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls acceptRequest when Accept button is clicked', async () => {
      renderComponent({ userId: validUserId });
      const invitesTab = document.querySelector('[data-testid="tab-invites"]') as HTMLButtonElement;

      act(() => {
        invitesTab.click();
      });

      const acceptBtn = document.querySelector('[data-testid="accept-btn"]') as HTMLButtonElement;
      expect(acceptBtn).toBeTruthy();

      await act(async () => {
        acceptBtn.click();
      });

      expect(mockHookResult.acceptRequest).toHaveBeenCalledWith(friendshipId);
    });

    it('calls declineRequest when Decline button is clicked', async () => {
      renderComponent({ userId: validUserId });
      const invitesTab = document.querySelector('[data-testid="tab-invites"]') as HTMLButtonElement;

      act(() => {
        invitesTab.click();
      });

      const declineBtn = document.querySelector('[data-testid="decline-btn"]') as HTMLButtonElement;
      expect(declineBtn).toBeTruthy();

      await act(async () => {
        declineBtn.click();
      });

      expect(mockHookResult.declineRequest).toHaveBeenCalledWith(friendshipId);
    });

    it('submits search form and displays search results', async () => {
      renderComponent({ userId: validUserId });
      const searchTab = document.querySelector('[data-testid="tab-search"]') as HTMLButtonElement;

      act(() => {
        searchTab.click();
      });

      const input = document.querySelector('[data-testid="search-input"]') as HTMLInputElement;
      const form = document.querySelector('form') as HTMLFormElement;

      act(() => {
        changeInputValue(input, 'alice');
      });

      await act(async () => {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      });

      expect(mockHookResult.searchUsers).toHaveBeenCalledWith('alice');
      
      const searchResultsList = document.querySelector('[data-testid="search-results"]');
      expect(searchResultsList).toBeTruthy();
      expect(document.querySelector('[data-testid="search-result-display-name"]')?.textContent).toBe('Bob Jones');
    });

    it('calls sendRequest when Add Friend button is clicked in search results', async () => {
      renderComponent({ userId: validUserId });
      const searchTab = document.querySelector('[data-testid="tab-search"]') as HTMLButtonElement;

      act(() => {
        searchTab.click();
      });

      // Directly click Add Friend in results
      const addFriendBtn = document.querySelector('[data-testid="send-request-btn"]') as HTMLButtonElement;
      expect(addFriendBtn).toBeTruthy();

      await act(async () => {
        addFriendBtn.click();
      });

      expect(mockHookResult.sendRequest).toHaveBeenCalledWith(thirdUserId);
      expect(document.querySelector('[data-testid="status-sent"]')).toBeTruthy();
    });
  });
});
