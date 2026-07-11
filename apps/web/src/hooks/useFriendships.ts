import { useState, useEffect, useCallback, useContext } from 'react';
import { Friendship, FriendshipStatus } from '../types/friendship';
import { Profile } from '../types/profile';
import { FriendshipService } from '../services/friendshipService';
import { FriendshipServiceContext } from '../services/FriendshipServiceContext';
import { ProfileService } from '../services/profileService';
import { ProfileServiceContext } from '../services/ProfileServiceContext';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export interface FriendWithProfile {
  friendshipId: string;
  profile: Profile;
  status: FriendshipStatus;
}

export interface UseFriendshipsResult {
  friends: FriendWithProfile[];
  pendingRequests: FriendWithProfile[];
  searchResults: Profile[];
  loading: boolean;
  error: string | null;
  fetchFriendships: () => Promise<void>;
  sendRequest: (friendId: string) => Promise<Friendship>;
  acceptRequest: (friendshipId: string) => Promise<Friendship>;
  declineRequest: (friendshipId: string) => Promise<Friendship>;
  searchUsers: (query: string) => Promise<void>;
  clearSearchResults: () => void;
}

/**
 * Custom hook to manage friendships state, loading, and error states.
 */
export function useFriendships(
  userId: string,
  customFriendshipService?: FriendshipService,
  customProfileService?: ProfileService
): UseFriendshipsResult {
  const contextFriendshipService = useContext(FriendshipServiceContext);
  const contextProfileService = useContext(ProfileServiceContext);

  const friendshipService = customFriendshipService || contextFriendshipService;
  const profileService = customProfileService || contextProfileService;

  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendWithProfile[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFriendships = useCallback(async () => {
    if (!friendshipService || !profileService) {
      setError('Services are not available');
      return;
    }
    if (!userId) {
      setError('User ID is required');
      return;
    }
    if (!isValidUuid(userId)) {
      setError('User ID must be a valid UUID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Fetch accepted friendships
      const acceptedFriendships = await friendshipService.getAcceptedFriends(userId);
      const friendIds = acceptedFriendships.map(f => f.user_id === userId ? f.friend_id : f.user_id);
      
      let friendProfiles: Profile[] = [];
      if (friendIds.length > 0) {
        friendProfiles = await profileService.getProfilesByIds(friendIds);
      }

      const friendsList: FriendWithProfile[] = acceptedFriendships.map(f => {
        const targetId = f.user_id === userId ? f.friend_id : f.user_id;
        const profile = friendProfiles.find(p => p.id === targetId) || {
          id: targetId,
          username: 'Unknown User',
          display_name: 'Unknown User',
          avatar_url: null,
          created_at: ''
        };
        return {
          friendshipId: f.id,
          profile,
          status: f.status
        };
      });

      // 2. Fetch pending requests received
      const pendingRes = await friendshipService.getPendingRequests(userId);
      const requesterIds = pendingRes.map(f => f.user_id);

      let requesterProfiles: Profile[] = [];
      if (requesterIds.length > 0) {
        requesterProfiles = await profileService.getProfilesByIds(requesterIds);
      }

      const pendingList: FriendWithProfile[] = pendingRes.map(f => {
        const profile = requesterProfiles.find(p => p.id === f.user_id) || {
          id: f.user_id,
          username: 'Unknown User',
          display_name: 'Unknown User',
          avatar_url: null,
          created_at: ''
        };
        return {
          friendshipId: f.id,
          profile,
          status: f.status
        };
      });

      setFriends(friendsList);
      setPendingRequests(pendingList);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [userId, friendshipService, profileService]);

  const sendRequest = useCallback(async (friendId: string): Promise<Friendship> => {
    if (!friendshipService) {
      throw new Error('FriendshipService is not available');
    }
    if (!friendId) {
      throw new Error('Friend ID is required');
    }
    if (!isValidUuid(friendId)) {
      throw new Error('Friend ID must be a valid UUID');
    }
    if (friendId === userId) {
      throw new Error('You cannot send a friendship request to yourself');
    }

    setLoading(true);
    setError(null);
    try {
      const created = await friendshipService.sendFriendRequest({
        user_id: userId,
        friend_id: friendId
      });
      return created;
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, friendshipService]);

  const acceptRequest = useCallback(async (friendshipId: string): Promise<Friendship> => {
    if (!friendshipService) {
      throw new Error('FriendshipService is not available');
    }
    if (!friendshipId) {
      throw new Error('Friendship ID is required');
    }
    if (!isValidUuid(friendshipId)) {
      throw new Error('Friendship ID must be a valid UUID');
    }

    setLoading(true);
    setError(null);
    try {
      const updated = await friendshipService.acceptFriendRequest(friendshipId, userId);
      // Refresh list
      await fetchFriendships();
      return updated;
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, friendshipService, fetchFriendships]);

  const declineRequest = useCallback(async (friendshipId: string): Promise<Friendship> => {
    if (!friendshipService) {
      throw new Error('FriendshipService is not available');
    }
    if (!friendshipId) {
      throw new Error('Friendship ID is required');
    }
    if (!isValidUuid(friendshipId)) {
      throw new Error('Friendship ID must be a valid UUID');
    }

    setLoading(true);
    setError(null);
    try {
      const updated = await friendshipService.declineFriendRequest(friendshipId, userId);
      // Refresh list
      await fetchFriendships();
      return updated;
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, friendshipService, fetchFriendships]);

  const searchUsers = useCallback(async (query: string): Promise<void> => {
    if (!profileService) {
      setError('ProfileService is not available');
      return;
    }
    if (!userId) {
      setError('User ID is required');
      return;
    }
    if (!isValidUuid(userId)) {
      setError('User ID must be a valid UUID');
      return;
    }

    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await profileService.searchProfiles(query, userId);
      setSearchResults(results);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [userId, profileService]);

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  // Auto-fetch on mount when valid userId is provided
  useEffect(() => {
    if (userId && isValidUuid(userId)) {
      fetchFriendships();
    } else {
      setFriends([]);
      setPendingRequests([]);
      if (userId && !isValidUuid(userId)) {
        setError('User ID must be a valid UUID');
      } else {
        setError(null);
      }
    }
  }, [userId, fetchFriendships]);

  return {
    friends,
    pendingRequests,
    searchResults,
    loading,
    error,
    fetchFriendships,
    sendRequest,
    acceptRequest,
    declineRequest,
    searchUsers,
    clearSearchResults,
  };
}
