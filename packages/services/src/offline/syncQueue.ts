import type { SyncOperation, SyncOperationStatus, SyncOperationType } from '@sprout/shared';
import type { KeyValueStorage } from '../supabase/client';
const queueKey = 'sprout_sync_queue_v1';
export class PersistentSyncQueue {
  constructor(private readonly storage: KeyValueStorage) { if (!storage) throw new Error('Storage is required'); }
  async list(): Promise<SyncOperation[]> { const raw = await this.storage.getItem(queueKey); if (!raw) return []; const value: unknown = JSON.parse(raw); if (!Array.isArray(value)) throw new Error('Stored sync queue is invalid'); return value as SyncOperation[]; }
  async enqueue(type: SyncOperationType, payload: unknown, operationId: string): Promise<SyncOperation> { if (!operationId.trim()) throw new Error('Operation ID is required'); const queue = await this.list(); const existing = queue.find(item => item.id === operationId); if (existing) return existing; const operation: SyncOperation = { id: operationId, type, payload, createdAt: new Date().toISOString(), retries: 0, status: 'pending' }; await this.save([...queue, operation]); return operation; }
  async update(id: string, status: SyncOperationStatus, lastError?: string): Promise<void> { const queue = await this.list(); await this.save(queue.map(item => item.id === id ? { ...item, status, retries: status === 'failed' ? item.retries + 1 : item.retries, lastError } : item)); }
  async remove(id: string): Promise<void> { await this.save((await this.list()).filter(item => item.id !== id)); }
  private async save(queue: SyncOperation[]): Promise<void> { await this.storage.setItem(queueKey, JSON.stringify(queue)); }
}
