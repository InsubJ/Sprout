import { describe, expect, it } from "vitest";
import { PersistentSyncQueue } from "./syncQueue";
class MemoryStorage {
  private data = new Map<string, string>();
  async getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  async setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  async removeItem(key: string) {
    this.data.delete(key);
  }
}
describe("PersistentSyncQueue", () => {
  it("deduplicates operations by client ID", async () => {
    const queue = new PersistentSyncQueue(new MemoryStorage());
    const first = {
      habit_id: "11111111-1111-1111-1111-111111111111",
      user_id: "22222222-2222-2222-2222-222222222222",
      note: "first",
    };
    await queue.enqueue("CREATE_LOG", first, "operation-1");
    await queue.enqueue("CREATE_LOG", { ...first, note: "second" }, "operation-1");
    expect(await queue.list()).toHaveLength(1);
  });
  it("tracks retries and removes completed operations", async () => {
    const queue = new PersistentSyncQueue(new MemoryStorage());
    await queue.enqueue(
      "UPDATE_HABIT",
      { id: "11111111-1111-1111-1111-111111111111", input: { name: "Updated" } },
      "operation-2",
    );
    await queue.update("operation-2", "failed", "offline");
    expect((await queue.list())[0]).toMatchObject({
      retries: 1,
      status: "failed",
      lastError: "offline",
    });
    await queue.remove("operation-2");
    expect(await queue.list()).toEqual([]);
  });
  it("rejects stored operations whose payload violates the operation contract", async () => {
    const storage = new MemoryStorage();
    await storage.setItem(
      "sprout_sync_queue_v1",
      JSON.stringify([
        {
          id: "bad",
          type: "CREATE_LOG",
          payload: {},
          createdAt: new Date().toISOString(),
          retries: 0,
          status: "pending",
        },
      ]),
    );
    await expect(new PersistentSyncQueue(storage).list()).rejects.toThrow(
      "Stored sync queue is invalid",
    );
  });
});
