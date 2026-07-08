import React, { createContext, useContext } from 'react';
import { InteractionService } from './interactionService';

export const InteractionServiceContext = createContext<InteractionService | null>(null);

export interface InteractionServiceProviderProps {
  service: InteractionService;
  children: React.ReactNode;
}

export const InteractionServiceProvider: React.FC<InteractionServiceProviderProps> = ({ service, children }) => {
  return (
    <InteractionServiceContext.Provider value={service}>
      {children}
    </InteractionServiceContext.Provider>
  );
};

export const useInteractionService = (): InteractionService => {
  const context = useContext(InteractionServiceContext);
  if (!context) {
    throw new Error('useInteractionService must be used within an InteractionServiceProvider');
  }
  return context;
};
