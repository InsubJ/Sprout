const allowedTypes = new Set([
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
]);
const allowedAnimations = new Set(["none", "gentle_sway", "soft_glimmer", "droop"]);
const allowedArchetypes = new Set([
  "tree",
  "shrub",
  "vine",
  "cactus_succulent",
  "flowering",
  "leafy",
  "fantasy_hybrid",
]);
const color = /^#[0-9a-f]{6}$/i;
export function validatePlantSpec(value: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!value || typeof value !== "object")
    return { valid: false, errors: ["Response is not an object"] };
  const spec = value as Record<string, any>;
  const keys = [
    "schemaVersion",
    "displayName",
    "description",
    "rarity",
    "canvas",
    "palette",
    "base",
    "layers",
    "stateVariants",
    "animation",
    "generationMetadata",
  ];
  if (Object.keys(spec).some((key) => !keys.includes(key)))
    errors.push("Unknown top-level property");
  if (
    spec.schemaVersion !== 1 ||
    spec.rarity !== "custom" ||
    spec.canvas?.viewBoxWidth !== 400 ||
    spec.canvas?.viewBoxHeight !== 400
  )
    errors.push("Invalid schema header");
  if (
    typeof spec.displayName !== "string" ||
    !spec.displayName.trim() ||
    spec.displayName.length > 60
  )
    errors.push("Invalid display name");
  if (
    typeof spec.description !== "string" ||
    !spec.description.trim() ||
    spec.description.length > 280
  )
    errors.push("Invalid description");
  const colors = Object.values(spec.palette ?? {});
  if (
    colors.length < 1 ||
    colors.length > 8 ||
    colors.some((item) => typeof item !== "string" || !color.test(item))
  )
    errors.push("Invalid palette");
  if (!Array.isArray(spec.layers) || spec.layers.length < 1 || spec.layers.length > 40)
    errors.push("Invalid layer count");
  const archetype = spec.generationMetadata?.archetype;
  if (!allowedArchetypes.has(archetype)) errors.push("Invalid plant archetype");
  if (archetype === "tree" && !spec.layers?.some((layer: any) => layer.type === "tree"))
    errors.push("Tree archetype requires native tree geometry");
  let primitives = 0;
  for (const layer of spec.layers ?? []) {
    if (!allowedTypes.has(layer.type)) errors.push("Unknown layer type");
    if (
      !layer.anchor ||
      typeof layer.anchor.x !== "number" ||
      !Number.isFinite(layer.anchor.x) ||
      layer.anchor.x < 20 ||
      layer.anchor.x > 380 ||
      typeof layer.anchor.y !== "number" ||
      !Number.isFinite(layer.anchor.y) ||
      layer.anchor.y < 20 ||
      layer.anchor.y > 380
    )
      errors.push("Layer outside safe bounds");
    if (
      typeof layer.scale !== "number" ||
      !Number.isFinite(layer.scale) ||
      layer.scale < 0.1 ||
      layer.scale > 2 ||
      typeof layer.rotation !== "number" ||
      !Number.isFinite(layer.rotation) ||
      layer.rotation < -180 ||
      layer.rotation > 180 ||
      !color.test(layer.fill ?? "")
    )
      errors.push("Invalid layer style");
    primitives += layer.count ?? layer.petalCount ?? 1;
  }
  if (primitives > 120) errors.push("Too many rendered primitives");
  for (const name of [spec.animation?.idle, spec.animation?.completed, spec.animation?.withered])
    if (!allowedAnimations.has(name)) errors.push("Unsupported animation");
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}
