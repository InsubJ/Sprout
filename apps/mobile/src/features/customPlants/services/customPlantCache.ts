import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  customPlantSchema,
  type CustomPlant,
  type GenerationCreditBalance,
  type PlantGenerationJob,
} from "@sprout/shared";
const plantsKey = (userId: string) => `sprout_custom_plants_v1:${userId}`;
const creditsKey = (userId: string) => `sprout_generation_credits_v1:${userId}`;
const jobKey = (userId: string) => `sprout_generation_job_v1:${userId}`;
export async function readCachedCustomPlants(userId: string): Promise<CustomPlant[]> {
  const raw = await AsyncStorage.getItem(plantsKey(userId));
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown[];
  return parsed.map((item) => customPlantSchema.parse(item));
}
export async function writeCachedCustomPlants(
  userId: string,
  plants: CustomPlant[],
): Promise<void> {
  await AsyncStorage.setItem(plantsKey(userId), JSON.stringify(plants));
}
export async function cacheSavedCustomPlant(
  userId: string,
  job: PlantGenerationJob,
  visibility: "friends" | "private",
): Promise<void> {
  if (!userId || !job.customPlantId || !job.generatedSpec)
    throw new Error("A completed custom plant is required for caching");
  const timestamp = job.completedAt ?? job.updatedAt;
  const plant = customPlantSchema.parse({
    id: job.customPlantId,
    userId,
    displayName: job.editedName ?? job.suggestedName ?? job.generatedSpec.displayName,
    originalPrompt: job.originalPrompt,
    sanitizedPrompt: job.sanitizedPrompt,
    description: job.generatedSpec.description,
    plantSpec: job.generatedSpec,
    renderVersion: 1,
    rarity: "custom",
    generationJobId: job.id,
    previewImageUrl: null,
    visibility,
    createdAt: timestamp,
    updatedAt: timestamp,
    archivedAt: null,
  });
  const cached = await readCachedCustomPlants(userId);
  await writeCachedCustomPlants(userId, [plant, ...cached.filter((item) => item.id !== plant.id)]);
}
export async function readCachedGenerationCredits(
  userId: string,
): Promise<GenerationCreditBalance | null> {
  const raw = await AsyncStorage.getItem(creditsKey(userId));
  return raw ? JSON.parse(raw) : null;
}
export async function writeCachedGenerationCredits(
  userId: string,
  balance: GenerationCreditBalance,
): Promise<void> {
  await AsyncStorage.setItem(creditsKey(userId), JSON.stringify(balance));
}
export async function readCachedGenerationJob(userId: string): Promise<PlantGenerationJob | null> {
  const raw = await AsyncStorage.getItem(jobKey(userId));
  return raw ? JSON.parse(raw) : null;
}
export async function writeCachedGenerationJob(
  userId: string,
  job: PlantGenerationJob | null,
): Promise<void> {
  if (job) await AsyncStorage.setItem(jobKey(userId), JSON.stringify(job));
  else await AsyncStorage.removeItem(jobKey(userId));
}
