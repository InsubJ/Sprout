import React, { createContext, useContext } from 'react';
import { HabitService } from './habitService';

export const HabitServiceContext = createContext<HabitService | null>(null);

export interface HabitServiceProviderProps {
  service: HabitService;
  children: React.ReactNode;
}

/**
 * Provider component to supply the HabitService instance to React component trees.
 */
export const HabitServiceProvider: React.FC<HabitServiceProviderProps> = ({ service, children }) => {
  return (
    <HabitServiceContext.Provider value={service}>
      {children}
    </HabitServiceContext.Provider>
  );
};

/**
 * Hook to retrieve the HabitService from context.
 * Throws an error if used outside a HabitServiceProvider.
 */
export const useHabitService = (): HabitService => {
  const context = useContext(HabitServiceContext);
  if (!context) {
    throw new Error('useHabitService must be used within a HabitServiceProvider');
  }
  return context;
};
