import type AsyncStorageType from "@react-native-async-storage/async-storage";
import type { GeneratedPlantSpec, PlantGenerationJob, CustomPlant } from "@sprout/shared";
import type { PlantGenerationRepository } from "@sprout/services";
import {
  readCachedCustomPlants,
  readCachedGenerationJob,
  writeCachedCustomPlants,
  writeCachedGenerationJob,
} from "../features/customPlants/services/customPlantCache";
import { createUuid } from "../features/customPlants/utils/createUuid";
import { consumeDemoGenerationCredit } from "../features/customPlants/services/demoRewardState";
const spec = (prompt: string): GeneratedPlantSpec => ({
  schemaVersion: 1,
  displayName: "Dreaming Sprout",
  description: `A one-of-a-kind plant inspired by ${prompt.slice(0, 80)}.`,
  rarity: "custom",
  canvas: { viewBoxWidth: 400, viewBoxHeight: 400 },
  palette: {
    primary: "#6E5AA8",
    secondary: "#A8D5BA",
    accent: "#F5DF8C",
    stem: "#466B4A",
    pot: "#8B6F47",
  },
  base: { potStyle: "classic", groundShadow: true },
  layers: [
    {
      type: "stalk",
      geometry: "stalk",
      anchor: { x: 200, y: 245 },
      scale: 1,
      rotation: 0,
      count: 1,
      fill: "#466B4A",
      zIndex: 10,
    },
    {
      type: "radial_leaf",
      geometry: "radial_leaf",
      anchor: { x: 200, y: 205 },
      scale: 1,
      rotation: 0,
      count: 7,
      fill: "#A8D5BA",
      stroke: "#466B4A",
      zIndex: 20,
    },
    {
      type: "radial_bloom",
      geometry: "radial_bloom",
      anchor: { x: 200, y: 130 },
      scale: 1,
      rotation: 0,
      petalCount: 10,
      fill: "#F5DF8C",
      stroke: "#6E5AA8",
      zIndex: 30,
    },
  ],
  stateVariants: { healthy: {}, withered: {}, completed: {} },
  animation: { idle: "gentle_sway", completed: "soft_glimmer", withered: "droop" },
  generationMetadata: {
    archetype: "leafy",
    promptSummary: prompt.slice(0, 160),
    reusedGeometryFamilies: ["stalk", "radial_leaf", "radial_bloom"],
  },
});
export class DemoPlantGenerationRepository implements PlantGenerationRepository {
  constructor(
    private readonly storage: Pick<typeof AsyncStorageType, "getItem" | "setItem">,
    private readonly resolveUserId?: () => Promise<string | null>,
  ) {}
  async generate(requestId: string, prompt: string): Promise<PlantGenerationJob> {
    const userId = await this.requireUser();
    const now = new Date().toISOString();
    const generated = spec(prompt);
    const job: PlantGenerationJob = {
      id: createUuid(),
      userId,
      status: "preview_ready",
      originalPrompt: prompt,
      sanitizedPrompt: prompt.trim(),
      suggestedName: generated.displayName,
      editedName: null,
      currentStep: "Preview ready",
      checklist: [
        { id: "moderate", label: "Check prompt safety", status: "complete" },
        { id: "plan", label: "Plan reusable plant geometry", status: "complete" },
        { id: "generate", label: "Generate plant specification", status: "complete" },
        { id: "validate", label: "Validate renderer constraints", status: "complete" },
      ],
      providerAttempts: [{ provider: "groq", attempt: 1, status: "succeeded" }],
      activeProvider: "groq",
      attemptCount: 1,
      failureCode: null,
      failureMessage: null,
      generatedSpec: generated,
      customPlantId: null,
      creditReservationId: requestId,
      createdAt: now,
      startedAt: now,
      completedAt: null,
      updatedAt: now,
    };
    await writeCachedGenerationJob(userId, job);
    return job;
  }
  async getJob(_jobId: string): Promise<PlantGenerationJob> {
    const job = await readCachedGenerationJob(await this.requireUser());
    if (!job) throw new Error("Generation job not found");
    return job;
  }
  async save(
    _jobId: string,
    displayName: string,
    visibility: "friends" | "private",
  ): Promise<PlantGenerationJob> {
    const userId = await this.requireUser();
    const job = await readCachedGenerationJob(userId);
    if (!job?.generatedSpec) throw new Error("Plant preview is not ready");
    const now = new Date().toISOString(),
      plantId = createUuid();
    const plant: CustomPlant = {
      id: plantId,
      userId,
      displayName: displayName.trim(),
      originalPrompt: job.originalPrompt,
      sanitizedPrompt: job.sanitizedPrompt,
      description: job.generatedSpec.description,
      plantSpec: job.generatedSpec,
      renderVersion: 1,
      rarity: "custom",
      generationJobId: job.id,
      previewImageUrl: null,
      visibility,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    };
    await writeCachedCustomPlants(userId, [plant, ...(await readCachedCustomPlants(userId))]);
    await consumeDemoGenerationCredit(this.storage, userId);
    const completed = {
      ...job,
      status: "completed" as const,
      editedName: plant.displayName,
      customPlantId: plantId,
      currentStep: "Saved to Sanctuary",
      completedAt: now,
      updatedAt: now,
    };
    await writeCachedGenerationJob(userId, completed);
    return completed;
  }
  private async requireUser() {
    const resolved = await this.resolveUserId?.();
    if (resolved) return resolved;
    const raw = await this.storage.getItem("sprout_demo_identity");
    const userId = raw ? (JSON.parse(raw) as { id?: string }).id : null;
    if (!userId) throw new Error("Sign in to create a plant");
    return userId;
  }
}
