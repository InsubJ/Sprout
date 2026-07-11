import React, { createContext, useContext } from 'react';
import { ProfileService } from './profileService';

export const ProfileServiceContext = createContext<ProfileService | null>(null);

export interface ProfileServiceProviderProps {
  service: ProfileService;
  children: React.ReactNode;
}

export const ProfileServiceProvider: React.FC<ProfileServiceProviderProps> = ({ service, children }) => {
  return (
    <ProfileServiceContext.Provider value={service}>
      {children}
    </ProfileServiceContext.Provider>
  );
};

export const useProfileService = (): ProfileService => {
  const context = useContext(ProfileServiceContext);
  if (!context) {
    throw new Error('useProfileService must be used within a ProfileServiceProvider');
  }
  return context;
};
