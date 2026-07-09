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
  updateCurrentUser: (updated: Profile) => void;
  pinCode: string | null;
  biometricsEnabled: boolean;
  isAppLocked: boolean;
  setPinCode: (pin: string | null) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  unlockApp: (pin?: string, bypassBiometrics?: boolean) => boolean;
  lockApp: () => void;
  loginWithProvider: (provider: 'google' | 'apple' | 'facebook') => Promise<Profile>;
  sendOtp: (email: string) => Promise<string>;
  verifyOtp: (email: string, code: string, expectedCode: string) => Promise<Profile>;
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

  // Lock and security states
  const [pinCode, _setPinCode] = useState<string | null>(null);
  const [biometricsEnabled, _setBiometricsEnabled] = useState<boolean>(false);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);

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

  // Sync security preferences when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const pin = localStorage.getItem(`sprout_pin_${currentUser.id}`);
      const bio = localStorage.getItem(`sprout_biometrics_${currentUser.id}`) === 'true';
      _setPinCode(pin);
      _setBiometricsEnabled(bio);
    } else {
      _setPinCode(null);
      _setBiometricsEnabled(false);
      setIsAppLocked(false);
    }
  }, [currentUser]);

  useEffect(() => {
    // Retrieve current user and theme from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sprout_current_user');
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          setCurrentUser(profile);
          const pin = localStorage.getItem(`sprout_pin_${profile.id}`);
          const bio = localStorage.getItem(`sprout_biometrics_${profile.id}`) === 'true';
          if (pin || bio) {
            setIsAppLocked(true);
          }
        } catch {
          // ignore
        }
      }

      // Initialize theme setting
      const theme = localStorage.getItem('sprout_theme');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
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

    const pin = localStorage.getItem(`sprout_pin_${profile.id}`);
    const bio = localStorage.getItem(`sprout_biometrics_${profile.id}`) === 'true';
    if (pin || bio) {
      setIsAppLocked(true);
    }

    return profile;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sprout_current_user');
    _setPinCode(null);
    _setBiometricsEnabled(false);
    setIsAppLocked(false);
  };

  const updateCurrentUser = (updated: Profile) => {
    setCurrentUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sprout_current_user', JSON.stringify(updated));
    }
  };

  const setPinCode = (pin: string | null) => {
    if (!currentUser) return;
    if (pin) {
      localStorage.setItem(`sprout_pin_${currentUser.id}`, pin);
      _setPinCode(pin);
    } else {
      localStorage.removeItem(`sprout_pin_${currentUser.id}`);
      _setPinCode(null);
    }
  };

  const setBiometricsEnabled = (enabled: boolean) => {
    if (!currentUser) return;
    localStorage.setItem(`sprout_biometrics_${currentUser.id}`, String(enabled));
    _setBiometricsEnabled(enabled);
  };

  const unlockApp = (pin?: string, bypassBiometrics?: boolean): boolean => {
    if (!currentUser) return false;

    const savedPin = localStorage.getItem(`sprout_pin_${currentUser.id}`);
    const savedBio = localStorage.getItem(`sprout_biometrics_${currentUser.id}`) === 'true';

    if (savedPin && pin === savedPin) {
      setIsAppLocked(false);
      return true;
    }

    if (savedBio && bypassBiometrics) {
      setIsAppLocked(false);
      return true;
    }

    if (!savedPin && !savedBio) {
      setIsAppLocked(false);
      return true;
    }

    return false;
  };

  const lockApp = () => {
    if (currentUser) {
      const savedPin = localStorage.getItem(`sprout_pin_${currentUser.id}`);
      const savedBio = localStorage.getItem(`sprout_biometrics_${currentUser.id}`) === 'true';
      if (savedPin || savedBio) {
        setIsAppLocked(true);
      }
    }
  };

  const loginWithProvider = async (provider: 'google' | 'apple' | 'facebook'): Promise<Profile> => {
    const username = `${provider}_user`;
    const displayName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;

    let profile: Profile | null = null;
    if (isMockMode) {
      profile = await services.profile.getProfileByUsername(username);
      if (!profile) {
        profile = await services.profile.createProfile(username, displayName);
      }
    } else {
      profile = await services.profile.getProfileByUsername(username);
    }

    if (!profile) {
      throw new Error(`Social login failed for ${provider}`);
    }

    setCurrentUser(profile);
    localStorage.setItem('sprout_current_user', JSON.stringify(profile));

    const pin = localStorage.getItem(`sprout_pin_${profile.id}`);
    const bio = localStorage.getItem(`sprout_biometrics_${profile.id}`) === 'true';
    if (pin || bio) {
      setIsAppLocked(true);
    }

    return profile;
  };

  const sendOtp = async (email: string): Promise<string> => {
    if (!email || !email.includes('@')) {
      throw new Error('Precondition failed: Please enter a valid email address');
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  };

  const verifyOtp = async (email: string, code: string, expectedCode: string): Promise<Profile> => {
    if (!email || !email.includes('@')) {
      throw new Error('Precondition failed: Invalid email address');
    }
    if (code !== expectedCode) {
      throw new Error('Invalid verification code');
    }

    const username = email.split('@')[0] || 'otp_user';
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);

    let profile: Profile | null = null;
    if (isMockMode) {
      profile = await services.profile.getProfileByUsername(username);
      if (!profile) {
        profile = await services.profile.createProfile(username, displayName);
      }
    } else {
      profile = await services.profile.getProfileByUsername(username);
    }

    if (!profile) {
      throw new Error(`Profile not found for username: ${username}`);
    }

    setCurrentUser(profile);
    localStorage.setItem('sprout_current_user', JSON.stringify(profile));

    const pin = localStorage.getItem(`sprout_pin_${profile.id}`);
    const bio = localStorage.getItem(`sprout_biometrics_${profile.id}`) === 'true';
    if (pin || bio) {
      setIsAppLocked(true);
    }

    return profile;
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
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      isMockMode,
      updateCurrentUser,
      pinCode,
      biometricsEnabled,
      isAppLocked,
      setPinCode,
      setBiometricsEnabled,
      unlockApp,
      lockApp,
      loginWithProvider,
      sendOtp,
      verifyOtp
    }}>
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
