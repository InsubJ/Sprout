import React, { createContext, useContext } from 'react';
import { WrappedService } from './wrappedService';

export const WrappedServiceContext = createContext<WrappedService | null>(null);

export interface WrappedServiceProviderProps {
  service: WrappedService;
  children: React.ReactNode;
}

/**
 * Provider component to supply the WrappedService instance to React component trees.
 */
export const WrappedServiceProvider: React.FC<WrappedServiceProviderProps> = ({ service, children }) => {
  return (
    <WrappedServiceContext.Provider value={service}>
      {children}
    </WrappedServiceContext.Provider>
  );
};

/**
 * Hook to retrieve the WrappedService from context.
 * Throws an error if used outside a WrappedServiceProvider.
 */
export const useWrappedService = (): WrappedService => {
  const context = useContext(WrappedServiceContext);
  if (!context) {
    throw new Error('useWrappedService must be used within a WrappedServiceProvider');
  }
  return context;
};
