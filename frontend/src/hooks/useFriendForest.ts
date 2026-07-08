import { useState, useEffect, useCallback, useContext } from 'react';
import { Profile } from '../types/profile';
import { Habit } from '../types/habit';
import { HabitLog } from '../types/habitLog';
import { ProfileService } from '../services/profileService';
import { ProfileServiceContext } from '../services/ProfileServiceContext';
import { FriendshipService } from '../services/friendshipService';
import { FriendshipServiceContext } from '../services/FriendshipServiceContext';
import { HabitService } from '../services/habitService';
import { HabitServiceContext } from '../services/HabitServiceContext';
import { LogService } from '../services/logService';
import { LogServiceContext } from '../services/LogServiceContext';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export interface ActiveProgress {
  totalHabits: number;
  healthyCount: number;
  witheredCount: number;
  completedCount: number;
  totalWaterings: number;
  currentWaterings: number;
}

export interface UseFriendForestResult {
  friendProfile: Profile | null;
  isMutuallyConnected: boolean;
  publicHabits: Habit[];
  recentLogs: HabitLog[];
  activeProgress: ActiveProgress;
  loading: boolean;
  error: string | null;
  fetchForestData: () => Promise<void>;
}

/**
 * Custom hook to load and manage a friend's public forest page state.
 * Validates mutual connection before retrieving habits and activities.
 */
export function useFriendForest(
  username: string,
  currentUserId: string,
  customProfileService?: ProfileService,
  customFriendshipService?: FriendshipService,
  customHabitService?: HabitService,
  customLogService?: LogService
): UseFriendForestResult {
  const contextProfileService = useContext(ProfileServiceContext);
  const contextFriendshipService = useContext(FriendshipServiceContext);
  const contextHabitService = useContext(HabitServiceContext);
  const contextLogService = useContext(LogServiceContext);

  const profileService = customProfileService || contextProfileService;
  const friendshipService = customFriendshipService || contextFriendshipService;
  const habitService = customHabitService || contextHabitService;
  const logService = customLogService || contextLogService;

  const [friendProfile, setFriendProfile] = useState<Profile | null>(null);
  const [isMutuallyConnected, setIsMutuallyConnected] = useState<boolean>(false);
  const [publicHabits, setPublicHabits] = useState<Habit[]>([]);
  const [recentLogs, setRecentLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeProgress, setActiveProgress] = useState<ActiveProgress>({
    totalHabits: 0,
    healthyCount: 0,
    witheredCount: 0,
    completedCount: 0,
    totalWaterings: 0,
    currentWaterings: 0,
  });

  const fetchForestData = useCallback(async () => {
    // DbC Preconditions
    if (!profileService || !friendshipService || !habitService || !logService) {
      setError('Required services are not available');
      return;
    }
    if (!username || username.trim() === '') {
      setError('Username is required');
      return;
    }
    if (!currentUserId) {
      setError('Current User ID is required');
      return;
    }
    if (!isValidUuid(currentUserId)) {
      setError('Current User ID must be a valid UUID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Resolve friend's profile from username
      const profile = await profileService.getProfileByUsername(username);
      if (!profile) {
        setError(`User @${username} not found`);
        setFriendProfile(null);
        setIsMutuallyConnected(false);
        setPublicHabits([]);
        setRecentLogs([]);
        return;
      }
      setFriendProfile(profile);

      // Check if looking at one's own profile
      if (profile.id === currentUserId) {
        setIsMutuallyConnected(true);
      } else {
        // 2. Retrieve accepted friendships of current user to verify mutual connection
        const acceptedFriendships = await friendshipService.getAcceptedFriends(currentUserId);
        const mutuallyConnected = acceptedFriendships.some(
          f => f.user_id === profile.id || f.friend_id === profile.id
        );
        setIsMutuallyConnected(mutuallyConnected);

        if (!mutuallyConnected) {
          // If not mutually connected, stop loading additional data
          setPublicHabits([]);
          setRecentLogs([]);
          return;
        }
      }

      // 3. Retrieve friend's habits and filter public ones
      const habits = await habitService.getHabits(profile.id);
      const publicList = habits.filter(h => h.is_public);
      setPublicHabits(publicList);

      // 4. Retrieve friend's logs
      const logs = await logService.getLogsByUserId(profile.id);
      setRecentLogs(logs);

      // 5. Calculate progress statistics for active public habits
      let healthyCount = 0;
      let witheredCount = 0;
      let completedCount = 0;
      let totalWaterings = 0;
      let currentWaterings = 0;

      publicList.forEach(h => {
        if (h.status === 'healthy') healthyCount++;
        else if (h.status === 'withered') witheredCount++;
        else if (h.status === 'completed') completedCount++;

        totalWaterings += h.target_waterings;
        currentWaterings += h.current_waterings;
      });

      setActiveProgress({
        totalHabits: publicList.length,
        healthyCount,
        witheredCount,
        completedCount,
        totalWaterings,
        currentWaterings,
      });

    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [username, currentUserId, profileService, friendshipService, habitService, logService]);

  useEffect(() => {
    fetchForestData();
  }, [username, currentUserId, fetchForestData]);

  return {
    friendProfile,
    isMutuallyConnected,
    publicHabits,
    recentLogs,
    activeProgress,
    loading,
    error,
    fetchForestData,
  };
}
