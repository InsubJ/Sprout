import { describe, expect, it } from 'vitest'; import { PersistentSyncQueue } from './syncQueue';
class MemoryStorage { private data = new Map<string, string>(); async getItem(key: string) { return this.data.get(key) ?? null; } async setItem(key: string, value: string) { this.data.set(key, value); } async removeItem(key: string) { this.data.delete(key); } }
describe('PersistentSyncQueue', () => {
  it('deduplicates operations by client ID', async () => { const queue = new PersistentSyncQueue(new MemoryStorage()); await queue.enqueue('CREATE_LOG', { value: 1 }, 'operation-1'); await queue.enqueue('CREATE_LOG', { value: 2 }, 'operation-1'); expect(await queue.list()).toHaveLength(1); });
  it('tracks retries and removes completed operations', async () => { const queue = new PersistentSyncQueue(new MemoryStorage()); await queue.enqueue('UPDATE_HABIT', {}, 'operation-2'); await queue.update('operation-2', 'failed', 'offline'); expect((await queue.list())[0]).toMatchObject({ retries: 1, status: 'failed', lastError: 'offline' }); await queue.remove('operation-2'); expect(await queue.list()).toEqual([]); });
});
