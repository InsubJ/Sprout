import type { HabitStatus } from "@sprout/shared";

export type LabPreviewStatus = Exclude<HabitStatus, "completed">;

export function labStatusFromProgress(
  growthProgress: number,
  selectedStatus: LabPreviewStatus,
): HabitStatus {
  if (!Number.isFinite(growthProgress) || growthProgress < 0 || growthProgress > 100)
    throw new RangeError("Lab growth progress must be between 0 and 100");
  if (selectedStatus !== "healthy" && selectedStatus !== "withered")
    throw new Error("Lab preview status must be healthy or withered");
  return growthProgress >= 100 ? "completed" : selectedStatus;
}
