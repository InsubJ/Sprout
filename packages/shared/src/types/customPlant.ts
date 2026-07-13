export const GENERATED_PLANT_LAYER_TYPES = [
  "tree",
  "stalk",
  "vine",
  "radial_bloom",
  "blossom_cluster",
  "radial_leaf",
  "pothos_leaf",
  "cactus_arm",
  "orchid_bloom",
  "rose_bloom",
  "sakura_cluster",
  "sunflower_head",
  "spider_leaf",
  "decorative_shape",
  "face",
  "accessory",
] as const;

export type GeneratedPlantLayerType = (typeof GENERATED_PLANT_LAYER_TYPES)[number];
export type GeneratedPlantAnimation = "none" | "gentle_sway" | "soft_glimmer" | "droop";
export const GENERATED_PLANT_ARCHETYPES = [
  "tree",
  "shrub",
  "vine",
  "cactus_succulent",
  "flowering",
  "leafy",
  "fantasy_hybrid",
] as const;
export type GeneratedPlantArchetype = (typeof GENERATED_PLANT_ARCHETYPES)[number];

export interface GeneratedPlantLayer {
  type: GeneratedPlantLayerType;
  geometry: string;
  anchor: { x: number; y: number };
  scale: number;
  rotation: number;
  count?: number;
  petalCount?: number;
  fill: string;
  stroke?: string;
  zIndex: number;
}

export interface GeneratedPlantSpec {
  schemaVersion: 1;
  displayName: string;
  description: string;
  rarity: "custom";
  canvas: { viewBoxWidth: 400; viewBoxHeight: 400 };
  palette: Record<string, string>;
  base: { potStyle: "classic" | "rounded" | "none"; groundShadow: boolean };
  layers: GeneratedPlantLayer[];
  stateVariants: {
    healthy: Record<string, unknown>;
    withered: Record<string, unknown>;
    completed: Record<string, unknown>;
  };
  animation: {
    idle: GeneratedPlantAnimation;
    completed: GeneratedPlantAnimation;
    withered: GeneratedPlantAnimation;
  };
  generationMetadata: {
    archetype?: GeneratedPlantArchetype;
    promptSummary: string;
    reusedGeometryFamilies: string[];
  };
}

export interface CustomPlant {
  id: string;
  userId: string;
  displayName: string;
  originalPrompt: string;
  sanitizedPrompt: string;
  description: string;
  plantSpec: GeneratedPlantSpec;
  renderVersion: 1;
  rarity: "custom";
  generationJobId: string;
  previewImageUrl: string | null;
  visibility: "friends" | "private";
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}
