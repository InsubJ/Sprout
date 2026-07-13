import type AsyncStorageType from "@react-native-async-storage/async-storage";
import type { CustomPlant } from "@sprout/shared";
import type { CustomPlantRepository } from "@sprout/services";
import {
  readCachedCustomPlants,
  writeCachedCustomPlants,
} from "../features/customPlants/services/customPlantCache";
type Storage = Pick<typeof AsyncStorageType, "getItem" | "setItem">;
export class DemoCustomPlantRepository implements CustomPlantRepository {
  constructor(private readonly _storage: Storage) {}
  async getByOwner(userId: string) {
    return readCachedCustomPlants(userId);
  }
  async getVisibleForUser(ownerId: string) {
    return (await readCachedCustomPlants(ownerId)).filter((p) => p.visibility === "friends");
  }
  async deleteById(plantId: string): Promise<void> {
    if (!plantId) throw new Error("Plant ID is required");
    const ownerIds = this.demoOwnerIds();
    for (const ownerId of ownerIds) {
      const plants = await readCachedCustomPlants(ownerId);
      if (!plants.some((plant) => plant.id === plantId)) continue;
      await writeCachedCustomPlants(
        ownerId,
        plants.filter((plant) => plant.id !== plantId),
      );
      return;
    }
    throw new Error("Custom plant not found");
  }
  async updateNameAndVisibility(
    plantId: string,
    displayName: string,
    visibility: "friends" | "private",
  ): Promise<CustomPlant> {
    const name = displayName.trim();
    if (!plantId || !name || name.length > 60)
      throw new Error("A valid plant ID and name are required");
    const ownerIds = this.demoOwnerIds();
    for (const ownerId of ownerIds) {
      const plants = await readCachedCustomPlants(ownerId);
      const found = plants.find((plant) => plant.id === plantId);
      if (!found) continue;
      const updated = {
        ...found,
        displayName: name,
        visibility,
        updatedAt: new Date().toISOString(),
      };
      await writeCachedCustomPlants(
        ownerId,
        plants.map((plant) => (plant.id === plantId ? updated : plant)),
      );
      return updated;
    }
    throw new Error("Custom plant not found");
  }
  private demoOwnerIds(): string[] {
    return [
      "11111111-1111-1111-1111-111111111111",
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      "cccccccc-cccc-cccc-cccc-cccccccccccc",
    ];
  }
}
