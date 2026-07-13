import type { CreateHabitLogInput, HabitLog } from "@sprout/shared";
import type { UploadAsset } from "./storageRepository";

export interface QueuedHabitLogInput extends CreateHabitLogInput {
  pending_asset?: UploadAsset;
}

export interface LogRepository {
  getById(id: string): Promise<HabitLog | null>;
  getByHabitId(habitId: string): Promise<HabitLog[]>;
  countForHabitOnDate(habitId: string, dateKey: string): Promise<number>;
  create(input: CreateHabitLogInput): Promise<HabitLog>;
}
