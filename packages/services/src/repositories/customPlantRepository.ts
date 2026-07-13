import type { CustomPlant } from "@sprout/shared";
export interface CustomPlantRepository {
  getByOwner(userId: string): Promise<CustomPlant[]>;
  getVisibleForUser(ownerId: string): Promise<CustomPlant[]>;
  deleteById(plantId: string): Promise<void>;
  updateNameAndVisibility(
    plantId: string,
    displayName: string,
    visibility: "friends" | "private",
  ): Promise<CustomPlant>;
}
