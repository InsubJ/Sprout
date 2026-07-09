'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profile } from '../../types/profile';
import { ProfileService } from '../../services/profileService';
import { HabitService } from '../../services/habitService';
import { FriendshipService } from '../../services/friendshipService';
import { LogService } from '../../services/logService';
import { NudgeService } from '../../services/nudgeService';
import { ProfileServiceContext } from '../../services/ProfileServiceContext';
import { HabitServiceContext } from '../../services/HabitServiceContext';
import { FriendshipServiceContext } from '../../services/FriendshipServiceContext';
import { LogServiceContext } from '../../services/LogServiceContext';
import { NudgeServiceContext } from '../../services/NudgeServiceContext';

import {
  MockProfileService,
  MockHabitService,
  MockFriendshipService,
  MockLogService,
  MockNudgeService
} from '../../services/mockServices';

interface AuthContextType {
  currentUser: Profile | null;
  login: (username: string) => Promise<Profile>;
  logout: () => void;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AppProviders');
  return context;
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Setup services (Supabase vs Mock)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isMockMode = !supabaseUrl || !supabaseKey;

  const [services, setServices] = useState<{
    profile: any;
    habit: any;
    friendship: any;
    log: any;
    nudge: any;
  }>(() => {
    if (isMockMode) {
      return {
        profile: new MockProfileService(),
        habit: new MockHabitService(),
        friendship: new MockFriendshipService(),
        log: new MockLogService(),
        nudge: new MockNudgeService()
      };
    } else {
      const client = createClient(supabaseUrl!, supabaseKey!);
      return {
        profile: new ProfileService(client),
        habit: new HabitService(client),
        friendship: new FriendshipService(client),
        log: new LogService(client),
        nudge: new NudgeService(client)
      };
    }
  });

  useEffect(() => {
    // Retrieve current user from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sprout_current_user');
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          setCurrentUser(profile);
        } catch {
          // ignore
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (username: string): Promise<Profile> => {
    let profile: Profile | null = null;
    if (isMockMode) {
      profile = await services.profile.getProfileByUsername(username);
      if (!profile) {
        // Create new user profile in mock database if it doesn't exist
        profile = await services.profile.createProfile(username, username);
      }
    } else {
      profile = await services.profile.getProfileByUsername(username);
    }
    
    if (!profile) {
      throw new Error(`Profile not found for username: ${username}`);
    }
    
    setCurrentUser(profile);
    localStorage.setItem('sprout_current_user', JSON.stringify(profile));
    return profile;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sprout_current_user');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--color-sand)',
        color: 'var(--color-evergreen)',
        fontFamily: 'var(--font-outfit), sans-serif'
      }}>
        Loading Sprout...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isMockMode }}>
      <ProfileServiceContext.Provider value={services.profile}>
        <HabitServiceContext.Provider value={services.habit}>
          <FriendshipServiceContext.Provider value={services.friendship}>
            <LogServiceContext.Provider value={services.log}>
              <NudgeServiceContext.Provider value={services.nudge}>
                {children}
              </NudgeServiceContext.Provider>
            </LogServiceContext.Provider>
          </FriendshipServiceContext.Provider>
        </HabitServiceContext.Provider>
      </ProfileServiceContext.Provider>
    </AuthContext.Provider>
  );
};
