import React, { createContext, useContext } from 'react';
import { FriendshipService } from './friendshipService';

export const FriendshipServiceContext = createContext<FriendshipService | null>(null);

export interface FriendshipServiceProviderProps {
  service: FriendshipService;
  children: React.ReactNode;
}

export const FriendshipServiceProvider: React.FC<FriendshipServiceProviderProps> = ({ service, children }) => {
  return (
    <FriendshipServiceContext.Provider value={service}>
      {children}
    </FriendshipServiceContext.Provider>
  );
};

export const useFriendshipService = (): FriendshipService => {
  const context = useContext(FriendshipServiceContext);
  if (!context) {
    throw new Error('useFriendshipService must be used within a FriendshipServiceProvider');
  }
  return context;
};
