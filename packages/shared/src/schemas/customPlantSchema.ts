import { z } from "zod";
import { GENERATED_PLANT_ARCHETYPES, GENERATED_PLANT_LAYER_TYPES } from "../types/customPlant";

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a six-digit hexadecimal colour");
function normalizeGeneratedPlantLayer(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const layer = value as Record<string, unknown>;
  const anchor =
    layer.anchor && typeof layer.anchor === "object" && !Array.isArray(layer.anchor)
      ? (layer.anchor as Record<string, unknown>)
      : {};
  return {
    ...layer,
    anchor: { x: anchor.x, y: anchor.y },
    scale: layer.scale ?? anchor.scale ?? 1,
    rotation: layer.rotation ?? anchor.rotation ?? 0,
  };
}
const layerSchema = z.preprocess(
  normalizeGeneratedPlantLayer,
  z
    .object({
      type: z.enum(GENERATED_PLANT_LAYER_TYPES),
      geometry: z.string().trim().min(1).max(40),
      anchor: z.object({ x: z.number().min(20).max(380), y: z.number().min(20).max(380) }).strict(),
      scale: z.number().min(0.1).max(2),
      rotation: z.number().min(-180).max(180),
      count: z.number().int().min(1).max(20).optional(),
      petalCount: z.number().int().min(3).max(24).optional(),
      fill: hexColor,
      stroke: hexColor.optional(),
      zIndex: z.number().int().min(0).max(100),
    })
    .strict(),
);
const animation = z.enum(["none", "gentle_sway", "soft_glimmer", "droop"]);
export const generatedPlantSpecSchema = z
  .object({
    schemaVersion: z.literal(1),
    displayName: z.string().trim().min(1).max(60),
    description: z.string().trim().min(1).max(280),
    rarity: z.literal("custom"),
    canvas: z.object({ viewBoxWidth: z.literal(400), viewBoxHeight: z.literal(400) }).strict(),
    palette: z
      .record(hexColor)
      .refine(
        (value) => Object.keys(value).length >= 1 && Object.keys(value).length <= 8,
        "Palette must contain 1-8 colours",
      ),
    base: z
      .object({ potStyle: z.enum(["classic", "rounded", "none"]), groundShadow: z.boolean() })
      .strict(),
    layers: z.array(layerSchema).min(1).max(40),
    stateVariants: z
      .object({
        healthy: z.record(z.unknown()),
        withered: z.record(z.unknown()),
        completed: z.record(z.unknown()),
      })
      .strict(),
    animation: z.object({ idle: animation, completed: animation, withered: animation }).strict(),
    generationMetadata: z
      .object({
        archetype: z.enum(GENERATED_PLANT_ARCHETYPES).default("fantasy_hybrid"),
        promptSummary: z.string().trim().min(1).max(160),
        reusedGeometryFamilies: z.array(z.string().trim().min(1).max(40)).max(16),
      })
      .strict(),
  })
  .strict();

export const customPlantSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    displayName: z.string().trim().min(1).max(60),
    originalPrompt: z.string().min(1).max(1000),
    sanitizedPrompt: z.string().min(1).max(1000),
    description: z.string().min(1).max(280),
    plantSpec: generatedPlantSpecSchema,
    renderVersion: z.literal(1),
    rarity: z.literal("custom"),
    generationJobId: z.string().uuid(),
    previewImageUrl: z.string().url().nullable(),
    visibility: z.enum(["friends", "private"]),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    archivedAt: z.string().datetime({ offset: true }).nullable(),
  })
  .strict();
