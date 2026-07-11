import { useState, useCallback, useContext } from 'react';
import { NudgeService } from '../services/nudgeService';
import { NudgeServiceContext } from '../services/NudgeServiceContext';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export interface UseWitherNudgeResult {
  nudgedHabits: Record<string, boolean>;
  loadingHabits: Record<string, boolean>;
  nudgeError: string | null;
  sendNudge: (habitId: string) => Promise<void>;
  checkNudgeStatus: (habitId: string) => Promise<boolean>;
}

export function useWitherNudge(
  senderId: string,
  receiverId: string | null | undefined,
  customNudgeService?: NudgeService
): UseWitherNudgeResult {
  const contextNudgeService = useContext(NudgeServiceContext);
  const nudgeService = customNudgeService || contextNudgeService;

  const [nudgedHabits, setNudgedHabits] = useState<Record<string, boolean>>({});
  const [loadingHabits, setLoadingHabits] = useState<Record<string, boolean>>({});
  const [nudgeError, setNudgeError] = useState<string | null>(null);

  // DbC: Preconditions validation at boundary
  if (!senderId) {
    throw new Error('Sender ID is required');
  }
  if (!isValidUuid(senderId)) {
    throw new Error('Sender ID must be a valid UUID');
  }
  if (receiverId !== undefined && receiverId !== null && receiverId !== '') {
    if (!isValidUuid(receiverId)) {
      throw new Error('Receiver ID must be a valid UUID');
    }
  }

  const checkNudgeStatus = useCallback(async (habitId: string): Promise<boolean> => {
    // DbC: Preconditions
    if (!habitId) {
      throw new Error('Habit ID is required');
    }
    if (!isValidUuid(habitId)) {
      throw new Error('Habit ID must be a valid UUID');
    }
    if (!nudgeService) {
      throw new Error('Nudge service is not available');
    }

    setLoadingHabits(prev => ({ ...prev, [habitId]: true }));
    setNudgeError(null);

    try {
      const nudged = await nudgeService.hasUserNudgedToday(senderId, habitId);
      setNudgedHabits(prev => ({ ...prev, [habitId]: nudged }));
      return nudged;
    } catch (err: any) {
      setNudgeError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setLoadingHabits(prev => ({ ...prev, [habitId]: false }));
    }
  }, [senderId, nudgeService]);

  const sendNudge = useCallback(async (habitId: string): Promise<void> => {
    // DbC: Preconditions
    if (!habitId) {
      throw new Error('Habit ID is required');
    }
    if (!isValidUuid(habitId)) {
      throw new Error('Habit ID must be a valid UUID');
    }
    if (!receiverId) {
      throw new Error('Receiver ID is required to send nudge');
    }
    if (!isValidUuid(receiverId)) {
      throw new Error('Receiver ID must be a valid UUID');
    }
    if (senderId === receiverId) {
      throw new Error('Sender and receiver cannot be the same user');
    }
    if (!nudgeService) {
      throw new Error('Nudge service is not available');
    }

    // Client-side check preventing duplicate requests if already nudged today
    if (nudgedHabits[habitId]) {
      return;
    }

    setLoadingHabits(prev => ({ ...prev, [habitId]: true }));
    setNudgeError(null);

    try {
      await nudgeService.sendNudge({
        sender_id: senderId,
        receiver_id: receiverId,
        habit_id: habitId,
      });
      setNudgedHabits(prev => ({ ...prev, [habitId]: true }));
    } catch (err: any) {
      setNudgeError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoadingHabits(prev => ({ ...prev, [habitId]: false }));
    }
  }, [senderId, receiverId, nudgedHabits, nudgeService]);

  return {
    nudgedHabits,
    loadingHabits,
    nudgeError,
    sendNudge,
    checkNudgeStatus,
  };
}
