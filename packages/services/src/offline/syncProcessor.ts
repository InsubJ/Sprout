import type { CreateHabitInput, SyncOperation, UpdateHabitInput } from "@sprout/shared";
import type { HabitRepository } from "../repositories/habitRepository";
import type { LogRepository } from "../repositories/logRepository";
import type { QueuedHabitLogInput } from "../repositories/logRepository";
import type { StorageRepository } from "../repositories/storageRepository";
import { PersistentSyncQueue } from "./syncQueue";
import { isRetryableRepositoryError } from "../errors/repositoryError";
export class SyncProcessor {
  constructor(
    private readonly queue: PersistentSyncQueue,
    private readonly habits: HabitRepository,
    private readonly logs: LogRepository,
    private readonly storage?: StorageRepository,
  ) {}
  async flush(): Promise<{ synced: number; failed: number }> {
    let synced = 0;
    let failed = 0;
    const operations = await this.queue.list();
    for (const operation of operations.filter(
      (item) => item.status === "pending" || item.status === "failed",
    )) {
      await this.queue.update(operation.id, "syncing");
      try {
        await this.execute(operation);
        await this.queue.remove(operation.id);
        synced += 1;
      } catch (cause) {
        await this.queue.update(
          operation.id,
          isRetryableRepositoryError(cause) ? "failed" : "permanent_failure",
          cause instanceof Error ? cause.message : "Sync failed",
        );
        failed += 1;
      }
    }
    return { synced, failed };
  }
  private async execute(operation: SyncOperation): Promise<void> {
    if (operation.type === "CREATE_LOG") {
      const payload = operation.payload as QueuedHabitLogInput;
      let imageUrl = payload.image_url;
      if (payload.pending_asset) {
        if (!this.storage) throw new Error("Photo storage is unavailable");
        imageUrl = await this.storage.uploadReflection(payload.user_id, payload.pending_asset);
      }
      const logInput = toDatabaseLogInput(payload, imageUrl);
      await this.logs.create({ ...logInput, image_url: imageUrl });
      return;
    }
    if (operation.type === "CREATE_HABIT") {
      await this.habits.create(operation.payload as CreateHabitInput);
      return;
    }
    const payload = operation.payload as {
      id: string;
      input: UpdateHabitInput;
    };
    await this.habits.update(payload.id, payload.input);
  }
}

function toDatabaseLogInput(
  input: QueuedHabitLogInput,
  imageUrl?: string,
): import("@sprout/shared").CreateHabitLogInput {
  return {
    habit_id: input.habit_id,
    user_id: input.user_id,
    client_operation_id: input.client_operation_id,
    note: input.note,
    image_url: imageUrl,
  };
}
