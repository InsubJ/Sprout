import type {
  CreateHabitInput,
  CreateHabitLogInput,
  SyncOperation,
  UpdateHabitInput,
} from "@sprout/shared";
import type { HabitRepository } from "../repositories/habitRepository";
import type { LogRepository } from "../repositories/logRepository";
import type {
  StorageRepository,
  UploadAsset,
} from "../repositories/storageRepository";
import { PersistentSyncQueue } from "./syncQueue";
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
      (item) => item.status !== "syncing",
    )) {
      await this.queue.update(operation.id, "syncing");
      try {
        await this.execute(operation);
        await this.queue.remove(operation.id);
        synced += 1;
      } catch (cause) {
        await this.queue.update(
          operation.id,
          "failed",
          cause instanceof Error ? cause.message : "Sync failed",
        );
        failed += 1;
      }
    }
    return { synced, failed };
  }
  private async execute(operation: SyncOperation): Promise<void> {
    if (operation.type === "CREATE_LOG") {
      const payload = operation.payload as CreateHabitLogInput & {
        pending_asset?: UploadAsset;
      };
      let imageUrl = payload.image_url;
      if (payload.pending_asset) {
        if (!this.storage) throw new Error("Photo storage is unavailable");
        imageUrl = await this.storage.uploadReflection(
          payload.user_id,
          payload.pending_asset,
        );
      }
      const { pending_asset: _pendingAsset, ...logInput } = payload;
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
