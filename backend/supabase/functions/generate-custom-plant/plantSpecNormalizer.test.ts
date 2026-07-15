import { describe, expect, it } from "vitest";
import { normalizePlantSpec } from "./plantSpecNormalizer";
import { validatePlantSpec } from "./plantSpecValidator";

const spec = {
  schemaVersion: 1,
  displayName: "Legacy Fern",
  description: "A generated fern with legacy transform placement.",
  rarity: "custom",
  canvas: { viewBoxWidth: 400, viewBoxHeight: 400 },
  palette: { primary: "#557755" },
  base: { potStyle: "classic", groundShadow: true },
  layers: [
    {
      type: "radial_leaf",
      geometry: "oval",
      anchor: { x: 200, y: 180, scale: 1.2, rotation: -8 },
      fill: "#557755",
      zIndex: 10,
    },
  ],
  stateVariants: { healthy: {}, withered: {}, completed: {} },
  animation: { idle: "gentle_sway", completed: "soft_glimmer", withered: "droop" },
  generationMetadata: {
    archetype: "leafy",
    promptSummary: "legacy fern",
    reusedGeometryFamilies: ["radial_leaf"],
  },
};

describe("plant specification normalization", () => {
  it("moves transforms out of anchors before validation", () => {
    const normalized = normalizePlantSpec(spec, "A leafy fern") as typeof spec & {
      layers: Array<Record<string, unknown>>;
    };

    expect(normalized.layers[0]).toMatchObject({
      anchor: { x: 200, y: 180 },
      scale: 1.2,
      rotation: -8,
    });
    expect(validatePlantSpec(normalized)).toEqual({ valid: true, errors: [] });
  });

  it("rejects missing transforms when normalization is bypassed", () => {
    expect(validatePlantSpec(spec).errors).toContain("Invalid layer style");
  });
});
