import React, { createContext, useContext } from 'react';
import { LogService } from './logService';

export const LogServiceContext = createContext<LogService | null>(null);

export interface LogServiceProviderProps {
  service: LogService;
  children: React.ReactNode;
}

/**
 * Provider component to supply the LogService instance to React component trees.
 */
export const LogServiceProvider: React.FC<LogServiceProviderProps> = ({ service, children }) => {
  return (
    <LogServiceContext.Provider value={service}>
      {children}
    </LogServiceContext.Provider>
  );
};

/**
 * Hook to retrieve the LogService from context.
 * Throws an error if used outside a LogServiceProvider.
 */
export const useLogService = (): LogService => {
  const context = useContext(LogServiceContext);
  if (!context) {
    throw new Error('useLogService must be used within a LogServiceProvider');
  }
  return context;
};
