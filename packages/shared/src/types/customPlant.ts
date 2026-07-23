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
  "custom_path",
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
  "floating_island",
  "bioluminescent_fungi",
  "crystal_spire",
  "terrarium_jar",
  "elemental_spirit",
] as const;
export type GeneratedPlantArchetype = (typeof GENERATED_PLANT_ARCHETYPES)[number];

export interface GeneratedPlantGradientStop {
  offset: number;
  color: string;
  opacity?: number;
}

export interface GeneratedPlantGradient {
  type: "linear" | "radial";
  stops: GeneratedPlantGradientStop[];
  angle?: number;
}

export interface GeneratedPlantParticles {
  type: "spores" | "sparkles" | "fireflies" | "petals" | "runes";
  count: number;
  color: string;
  spreadRadius?: number;
}

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
  strokeWidth?: number;
  pathData?: string;
  gradient?: GeneratedPlantGradient;
  particles?: GeneratedPlantParticles;
  zIndex: number;
}

export interface GeneratedPlantSpec {
  schemaVersion: 1;
  displayName: string;
  description: string;
  rarity: "custom";
  canvas: { viewBoxWidth: 400; viewBoxHeight: 400 };
  palette: Record<string, string>;
  base: {
    potStyle: "classic" | "rounded" | "none" | "floating_island" | "terrarium_jar" | "crystal_base";
    groundShadow: boolean;
  };
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
