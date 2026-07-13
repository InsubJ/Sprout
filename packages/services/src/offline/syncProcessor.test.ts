import { describe, expect, it, vi } from "vitest";
import { RepositoryError } from "../errors/repositoryError";
import type { HabitRepository } from "../repositories/habitRepository";
import type { LogRepository } from "../repositories/logRepository";
import { PersistentSyncQueue } from "./syncQueue";
import { SyncProcessor } from "./syncProcessor";

class MemoryStorage {
  private data = new Map<string, string>();
  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }
  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }
  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  }
}
const habits = {
  getById: vi.fn(),
  getByUserId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
} as unknown as HabitRepository;
function logsWith(error: RepositoryError): LogRepository {
  return {
    getById: vi.fn(),
    getByHabitId: vi.fn(),
    countForHabitOnDate: vi.fn(),
    create: vi.fn().mockRejectedValue(error),
  } as unknown as LogRepository;
}
async function queuedProcessor(
  error: RepositoryError,
): Promise<{ queue: PersistentSyncQueue; processor: SyncProcessor }> {
  const queue = new PersistentSyncQueue(new MemoryStorage());
  await queue.enqueue(
    "CREATE_LOG",
    {
      habit_id: "11111111-1111-1111-1111-111111111111",
      user_id: "22222222-2222-2222-2222-222222222222",
    },
    "operation-1",
  );
  return { queue, processor: new SyncProcessor(queue, habits, logsWith(error)) };
}

describe("SyncProcessor failure contract", () => {
  it("retains transient failures for retry", async () => {
    const { queue, processor } = await queuedProcessor(new RepositoryError("offline", "network"));
    await processor.flush();
    expect((await queue.list())[0]).toMatchObject({ status: "failed", retries: 1 });
  });
  it("marks permanent failures terminal so later flushes do not retry", async () => {
    const { queue, processor } = await queuedProcessor(
      new RepositoryError("denied", "authorization"),
    );
    await processor.flush();
    expect((await queue.list())[0]).toMatchObject({ status: "permanent_failure", retries: 0 });
    const second = await processor.flush();
    expect(second).toEqual({ synced: 0, failed: 0 });
  });
});
