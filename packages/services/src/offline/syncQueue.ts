import type { SyncOperation, SyncOperationStatus, SyncOperationType } from "@sprout/shared";
import type { CreateHabitInput, UpdateHabitInput } from "@sprout/shared";
import type { KeyValueStorage } from "../supabase/client";
import type { QueuedHabitLogInput } from "../repositories/logRepository";
const queueKey = "sprout_sync_queue_v1";
interface SyncPayloadMap {
  CREATE_LOG: QueuedHabitLogInput;
  CREATE_HABIT: CreateHabitInput;
  UPDATE_HABIT: { id: string; input: UpdateHabitInput };
}
const statuses: SyncOperationStatus[] = ["pending", "syncing", "failed", "permanent_failure"];
const types: SyncOperationType[] = ["CREATE_LOG", "CREATE_HABIT", "UPDATE_HABIT"];
function isSyncOperation(value: unknown): value is SyncOperation {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SyncOperation>;
  return (
    typeof item.id === "string" &&
    types.includes(item.type as SyncOperationType) &&
    typeof item.createdAt === "string" &&
    Number.isInteger(item.retries) &&
    statuses.includes(item.status as SyncOperationStatus) &&
    "payload" in item &&
    isPayloadValid(item.type as SyncOperationType, item.payload)
  );
}
function isPayloadValid(type: SyncOperationType, payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const value = payload as Record<string, unknown>;
  if (type === "CREATE_LOG")
    return typeof value.habit_id === "string" && typeof value.user_id === "string";
  if (type === "CREATE_HABIT")
    return typeof value.user_id === "string" && typeof value.name === "string";
  return typeof value.id === "string" && Boolean(value.input && typeof value.input === "object");
}
export class PersistentSyncQueue {
  constructor(private readonly storage: KeyValueStorage) {
    if (!storage) throw new Error("Storage is required");
  }
  async list(): Promise<SyncOperation[]> {
    const raw = await this.storage.getItem(queueKey);
    if (!raw) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || !value.every(isSyncOperation))
      throw new Error("Stored sync queue is invalid");
    return value;
  }
  async enqueue<T extends SyncOperationType>(
    type: T,
    payload: SyncPayloadMap[T],
    operationId: string,
  ): Promise<SyncOperation> {
    if (!operationId.trim()) throw new Error("Operation ID is required");
    const queue = await this.list();
    const existing = queue.find((item) => item.id === operationId);
    if (existing) return existing;
    const operation: SyncOperation = {
      id: operationId,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retries: 0,
      status: "pending",
    };
    await this.save([...queue, operation]);
    return operation;
  }
  async update(id: string, status: SyncOperationStatus, lastError?: string): Promise<void> {
    const queue = await this.list();
    await this.save(
      queue.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              retries: status === "failed" ? item.retries + 1 : item.retries,
              lastError,
            }
          : item,
      ),
    );
  }
  async remove(id: string): Promise<void> {
    await this.save((await this.list()).filter((item) => item.id !== id));
  }
  private async save(queue: SyncOperation[]): Promise<void> {
    await this.storage.setItem(queueKey, JSON.stringify(queue));
  }
}
