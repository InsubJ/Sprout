import React, { createContext, useContext } from 'react';
import { NudgeService } from './nudgeService';

export const NudgeServiceContext = createContext<NudgeService | null>(null);

export interface NudgeServiceProviderProps {
  service: NudgeService;
  children: React.ReactNode;
}

export const NudgeServiceProvider: React.FC<NudgeServiceProviderProps> = ({ service, children }) => {
  return (
    <NudgeServiceContext.Provider value={service}>
      {children}
    </NudgeServiceContext.Provider>
  );
};

export const useNudgeService = (): NudgeService => {
  const context = useContext(NudgeServiceContext);
  if (!context) {
    throw new Error('useNudgeService must be used within a NudgeServiceProvider');
  }
  return context;
};
