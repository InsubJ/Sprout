import React, { createContext, useContext } from 'react';
import { StorageService } from './storageService';

export const StorageServiceContext = createContext<StorageService | null>(null);

export interface StorageServiceProviderProps {
  service: StorageService;
  children: React.ReactNode;
}

/**
 * Provider component to supply the StorageService instance to React component trees.
 */
export const StorageServiceProvider: React.FC<StorageServiceProviderProps> = ({ service, children }) => {
  return (
    <StorageServiceContext.Provider value={service}>
      {children}
    </StorageServiceContext.Provider>
  );
};

/**
 * Hook to retrieve the StorageService from context.
 * Throws an error if used outside a StorageServiceProvider.
 */
export const useStorageService = (): StorageService => {
  const context = useContext(StorageServiceContext);
  if (!context) {
    throw new Error('useStorageService must be used within a StorageServiceProvider');
  }
  return context;
};
