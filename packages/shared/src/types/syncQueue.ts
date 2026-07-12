export type SyncOperationType = 'CREATE_LOG' | 'CREATE_HABIT' | 'UPDATE_HABIT';
export type SyncOperationStatus = 'pending' | 'syncing' | 'failed';
export interface SyncOperation { id: string; type: SyncOperationType; payload: unknown; createdAt: string; retries: number; status: SyncOperationStatus; lastError?: string; }
