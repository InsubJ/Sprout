type PlantArchetype =
  | "tree"
  | "shrub"
  | "vine"
  | "cactus_succulent"
  | "flowering"
  | "leafy"
  | "fantasy_hybrid";

const treePrompt = /\b(tree|oak|eucalyptus|willow|bonsai|pine|maple|cedar|forest|canopy|trunk)\b/i;

function inferredArchetype(
  prompt: string,
  layers: Array<Record<string, unknown>>,
): PlantArchetype | null {
  if (treePrompt.test(prompt)) return "tree";
  if (/\b(cactus|cacti|succulent|agave|aloe)\b/i.test(prompt)) return "cactus_succulent";
  if (/\b(vine|ivy|creeper|climber|trailing)\b/i.test(prompt)) return "vine";
  if (/\b(shrub|bush|hedge)\b/i.test(prompt)) return "shrub";
  if (/\b(flower|blossom|bloom|orchid|rose|sunflower|sakura)\b/i.test(prompt)) return "flowering";
  if (/\b(fern|leafy|foliage|pothos|monstera|calathea)\b/i.test(prompt)) return "leafy";
  if (layers.some((layer) => layer.type === "tree")) return "tree";
  return null;
}

function treeGeometry(prompt: string, current: unknown): string {
  if (/\beucalyptus\b/i.test(prompt)) return "eucalyptus";
  if (/\bwillow\b/i.test(prompt)) return "willow";
  if (/\bbonsai\b/i.test(prompt)) return "bonsai";
  if (/\b(pine|cedar)\b/i.test(prompt)) return "needle";
  if (/\b(oak|maple)\b/i.test(prompt)) return "oak";
  return typeof current === "string" && current.length > 0 ? current : "fantasy_tree";
}

function paletteColor(
  palette: Record<string, unknown>,
  preferredKeys: string[],
  fallback: string,
): string {
  for (const key of preferredKeys) {
    const value = palette[key];
    if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) return value;
  }
  return fallback;
}

function deterministicTreeLayer(
  prompt: string,
  palette: Record<string, unknown>,
): Record<string, unknown> {
  return {
    type: "tree",
    geometry: treeGeometry(prompt, null),
    anchor: { x: 200, y: 105 },
    scale: 1.25,
    rotation: 0,
    count: 7,
    fill: paletteColor(palette, ["trunk", "bark", "stem"], "#6B4A2F"),
    stroke: paletteColor(palette, ["bark", "trunk", "stem"], "#4B3424"),
    zIndex: 8,
  };
}

function normalizeTreeLayer(layer: Record<string, any>, prompt: string): Record<string, unknown> {
  const anchor = layer.anchor ?? {};
  return {
    ...layer,
    geometry: treeGeometry(prompt, layer.geometry),
    anchor: {
      x: Math.min(235, Math.max(165, Number(anchor.x) || 200)),
      y: Math.min(145, Math.max(75, Number(anchor.y) || 105)),
    },
    scale: Math.min(1.65, Math.max(1.15, Number(layer.scale) || 1.25)),
    count: Math.min(9, Math.max(6, Number(layer.count) || 7)),
  };
}

export function normalizePlantSpec(value: unknown, prompt: string): unknown {
  if (!value || typeof value !== "object") return value;
  const source = value as Record<string, any>;
  const layers = Array.isArray(source.layers)
    ? source.layers.map((layer: unknown) =>
        layer && typeof layer === "object" ? { ...(layer as Record<string, unknown>) } : layer,
      )
    : [];
  const metadata =
    source.generationMetadata && typeof source.generationMetadata === "object"
      ? { ...source.generationMetadata }
      : {};
  const inferred = inferredArchetype(prompt, layers as Array<Record<string, unknown>>);
  const archetype = inferred ?? metadata.archetype ?? "fantasy_hybrid";
  if (archetype !== "tree")
    return { ...source, layers, generationMetadata: { ...metadata, archetype } };

  const treeIndex = layers.findIndex((layer: any) => layer?.type === "tree");
  if (treeIndex >= 0) layers[treeIndex] = normalizeTreeLayer(layers[treeIndex] as any, prompt);
  else {
    const tree = deterministicTreeLayer(prompt, source.palette ?? {});
    if (layers.length < 40) layers.unshift(tree);
    else layers[0] = tree;
  }
  return {
    ...source,
    layers,
    generationMetadata: { ...metadata, archetype: "tree" },
  };
}
