// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useFriendships } from '../hooks/useFriendships';
import { Friendship } from '../types/friendship';
import { Profile } from '../types/profile';

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

describe('useFriendships Hook', () => {
  const validUserId = '11111111-1111-1111-1111-111111111111';
  const otherUserId = '22222222-2222-2222-2222-222222222222';
  const friendshipId = '99999999-9999-9999-9999-999999999999';

  const mockFriendship: Friendship = {
    id: friendshipId,
    user_id: validUserId,
    friend_id: otherUserId,
    status: 'accepted',
    created_at: new Date().toISOString()
  };

  const mockPendingFriendship: Friendship = {
    id: friendshipId,
    user_id: otherUserId,
    friend_id: validUserId,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  const mockProfile: Profile = {
    id: otherUserId,
    username: 'alice',
    display_name: 'Alice Smith',
    avatar_url: null,
    created_at: new Date().toISOString()
  };

  let mockFriendshipService: any;
  let mockProfileService: any;

  beforeEach(() => {
    mockFriendshipService = {
      getAcceptedFriends: vi.fn().mockResolvedValue([mockFriendship]),
      getPendingRequests: vi.fn().mockResolvedValue([mockPendingFriendship]),
      sendFriendRequest: vi.fn(),
      acceptFriendRequest: vi.fn(),
      declineFriendRequest: vi.fn(),
    };

    mockProfileService = {
      getProfilesByIds: vi.fn().mockResolvedValue([mockProfile]),
      searchProfiles: vi.fn().mockResolvedValue([mockProfile]),
    };
  });

  describe('Initial Fetch behavior', () => {
    it('should fetch friendships and pending requests on mount when valid userId is provided', async () => {
      let hook: any;
      await act(async () => {
        hook = renderHook(
          ({ userId }) => useFriendships(userId, mockFriendshipService, mockProfileService),
          { userId: validUserId }
        );
      });

      expect(mockFriendshipService.getAcceptedFriends).toHaveBeenCalledWith(validUserId);
      expect(mockFriendshipService.getPendingRequests).toHaveBeenCalledWith(validUserId);
      expect(mockProfileService.getProfilesByIds).toHaveBeenCalledWith([otherUserId]);
      
      expect(hook.result.current.loading).toBe(false);
      expect(hook.result.current.error).toBeNull();
      expect(hook.result.current.friends.length).toBe(1);
      expect(hook.result.current.friends[0].profile.username).toBe('alice');
      expect(hook.result.current.pendingRequests.length).toBe(1);
      expect(hook.result.current.pendingRequests[0].profile.username).toBe('alice');
      
      hook.unmount();
    });

    it('should set error if userId is not a valid UUID', async () => {
      let hook: any;
      await act(async () => {
        hook = renderHook(
          ({ userId }) => useFriendships(userId, mockFriendshipService, mockProfileService),
          { userId: 'invalid-id' }
        );
      });

      expect(mockFriendshipService.getAcceptedFriends).not.toHaveBeenCalled();
      expect(hook.result.current.error).toBe('User ID must be a valid UUID');
      hook.unmount();
    });
  });

  describe('Mutation Actions', () => {
    it('should successfully send a friend request', async () => {
      mockFriendshipService.sendFriendRequest.mockResolvedValue({
        id: 'new-id',
        user_id: validUserId,
        friend_id: otherUserId,
        status: 'pending',
        created_at: ''
      });

      let hook: any;
      await act(async () => {
        hook = renderHook(
          ({ userId }) => useFriendships(userId, mockFriendshipService, mockProfileService),
          { userId: validUserId }
        );
      });

      let result: any;
      await act(async () => {
        result = await hook.result.current.sendRequest(otherUserId);
      });

      expect(mockFriendshipService.sendFriendRequest).toHaveBeenCalledWith({
        user_id: validUserId,
        friend_id: otherUserId
      });
      expect(result.status).toBe('pending');
      hook.unmount();
    });

    it('should accept request and trigger refetch', async () => {
      mockFriendshipService.acceptFriendRequest.mockResolvedValue({
        id: friendshipId,
        user_id: otherUserId,
        friend_id: validUserId,
        status: 'accepted',
        created_at: ''
      });

      let hook: any;
      await act(async () => {
        hook = renderHook(
          ({ userId }) => useFriendships(userId, mockFriendshipService, mockProfileService),
          { userId: validUserId }
        );
      });

      // Clear calls from mount
      mockFriendshipService.getAcceptedFriends.mockClear();
      mockFriendshipService.getPendingRequests.mockClear();

      await act(async () => {
        await hook.result.current.acceptRequest(friendshipId);
      });

      expect(mockFriendshipService.acceptFriendRequest).toHaveBeenCalledWith(friendshipId, validUserId);
      expect(mockFriendshipService.getAcceptedFriends).toHaveBeenCalledWith(validUserId);
      expect(mockFriendshipService.getPendingRequests).toHaveBeenCalledWith(validUserId);
      hook.unmount();
    });

    it('should decline request and trigger refetch', async () => {
      mockFriendshipService.declineFriendRequest.mockResolvedValue({
        id: friendshipId,
        user_id: otherUserId,
        friend_id: validUserId,
        status: 'declined',
        created_at: ''
      });

      let hook: any;
      await act(async () => {
        hook = renderHook(
          ({ userId }) => useFriendships(userId, mockFriendshipService, mockProfileService),
          { userId: validUserId }
        );
      });

      // Clear calls from mount
      mockFriendshipService.getAcceptedFriends.mockClear();
      mockFriendshipService.getPendingRequests.mockClear();

      await act(async () => {
        await hook.result.current.declineRequest(friendshipId);
      });

      expect(mockFriendshipService.declineFriendRequest).toHaveBeenCalledWith(friendshipId, validUserId);
      expect(mockFriendshipService.getAcceptedFriends).toHaveBeenCalledWith(validUserId);
      expect(mockFriendshipService.getPendingRequests).toHaveBeenCalledWith(validUserId);
      hook.unmount();
    });

    it('should search users successfully', async () => {
      let hook: any;
      await act(async () => {
        hook = renderHook(
          ({ userId }) => useFriendships(userId, mockFriendshipService, mockProfileService),
          { userId: validUserId }
        );
      });

      await act(async () => {
        await hook.result.current.searchUsers('alice');
      });

      expect(mockProfileService.searchProfiles).toHaveBeenCalledWith('alice', validUserId);
      expect(hook.result.current.searchResults).toEqual([mockProfile]);
      hook.unmount();
    });
  });
});
