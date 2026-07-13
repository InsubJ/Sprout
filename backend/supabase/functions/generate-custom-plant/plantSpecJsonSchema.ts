const hexColor = { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" } as const;
export const plantSpecJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
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
  ],
  properties: {
    schemaVersion: { const: 1 },
    displayName: { type: "string", minLength: 1, maxLength: 60 },
    description: { type: "string", minLength: 1, maxLength: 280 },
    rarity: { const: "custom" },
    canvas: {
      type: "object",
      additionalProperties: false,
      required: ["viewBoxWidth", "viewBoxHeight"],
      properties: { viewBoxWidth: { const: 400 }, viewBoxHeight: { const: 400 } },
    },
    palette: { type: "object", minProperties: 1, maxProperties: 8, additionalProperties: hexColor },
    base: {
      type: "object",
      additionalProperties: false,
      required: ["potStyle", "groundShadow"],
      properties: {
        potStyle: { enum: ["classic", "rounded", "none"] },
        groundShadow: { type: "boolean" },
      },
    },
    layers: {
      type: "array",
      minItems: 1,
      maxItems: 40,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "geometry", "anchor", "scale", "rotation", "fill", "zIndex"],
        properties: {
          type: {
            enum: [
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
            ],
          },
          geometry: { type: "string", minLength: 1, maxLength: 40 },
          anchor: {
            type: "object",
            additionalProperties: false,
            required: ["x", "y"],
            properties: {
              x: { type: "number", minimum: 20, maximum: 380 },
              y: { type: "number", minimum: 20, maximum: 380 },
            },
          },
          scale: { type: "number", minimum: 0.1, maximum: 2 },
          rotation: { type: "number", minimum: -180, maximum: 180 },
          count: { type: "integer", minimum: 1, maximum: 20 },
          petalCount: { type: "integer", minimum: 3, maximum: 24 },
          fill: hexColor,
          stroke: hexColor,
          zIndex: { type: "integer", minimum: 0, maximum: 100 },
        },
      },
    },
    stateVariants: {
      type: "object",
      additionalProperties: false,
      required: ["healthy", "withered", "completed"],
      properties: {
        healthy: { type: "object", additionalProperties: false },
        withered: { type: "object", additionalProperties: false },
        completed: { type: "object", additionalProperties: false },
      },
    },
    animation: {
      type: "object",
      additionalProperties: false,
      required: ["idle", "completed", "withered"],
      properties: {
        idle: { enum: ["none", "gentle_sway", "soft_glimmer", "droop"] },
        completed: { enum: ["none", "gentle_sway", "soft_glimmer", "droop"] },
        withered: { enum: ["none", "gentle_sway", "soft_glimmer", "droop"] },
      },
    },
    generationMetadata: {
      type: "object",
      additionalProperties: false,
      required: ["archetype", "promptSummary", "reusedGeometryFamilies"],
      properties: {
        archetype: {
          enum: [
            "tree",
            "shrub",
            "vine",
            "cactus_succulent",
            "flowering",
            "leafy",
            "fantasy_hybrid",
          ],
        },
        promptSummary: { type: "string", minLength: 1, maxLength: 160 },
        reusedGeometryFamilies: {
          type: "array",
          maxItems: 16,
          items: { type: "string", minLength: 1, maxLength: 40 },
        },
      },
    },
  },
} as const;
export const openRouterPlantResponseFormat = {
  type: "json_schema",
  json_schema: { name: "sprout_generated_plant_spec", strict: true, schema: plantSpecJsonSchema },
} as const;

export const groqPlantResponseFormat = {
  type: "json_schema",
  json_schema: { name: "sprout_generated_plant_spec", strict: false, schema: plantSpecJsonSchema },
} as const;
