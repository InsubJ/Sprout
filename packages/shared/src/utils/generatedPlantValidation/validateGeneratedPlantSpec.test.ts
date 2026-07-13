import { describe, expect, it } from "vitest";
import { validateGeneratedPlantSpec } from "./validateGeneratedPlantSpec";

const validSpec = {
  schemaVersion: 1,
  displayName: "Moon Fern",
  description: "A quiet moonlit fern.",
  rarity: "custom",
  canvas: { viewBoxWidth: 400, viewBoxHeight: 400 },
  palette: { primary: "#557755" },
  base: { potStyle: "classic", groundShadow: true },
  layers: [
    {
      type: "radial_leaf",
      geometry: "radial_leaf",
      anchor: { x: 200, y: 180 },
      scale: 1,
      rotation: 0,
      count: 6,
      fill: "#557755",
      zIndex: 10,
    },
  ],
  stateVariants: { healthy: {}, withered: {}, completed: {} },
  animation: { idle: "gentle_sway", completed: "soft_glimmer", withered: "droop" },
  generationMetadata: {
    archetype: "leafy",
    promptSummary: "moon fern",
    reusedGeometryFamilies: ["radial_leaf"],
  },
};
describe("generated plant validation", () => {
  it("accepts a bounded declarative plant", () =>
    expect(validateGeneratedPlantSpec(validSpec).valid).toBe(true));
  it("rejects arbitrary SVG paths and unknown fields", () =>
    expect(validateGeneratedPlantSpec({ ...validSpec, path: "M0 0" }).valid).toBe(false));
  it("rejects out-of-bounds anchors", () =>
    expect(
      validateGeneratedPlantSpec({
        ...validSpec,
        layers: [{ ...validSpec.layers[0], anchor: { x: 999, y: 180 } }],
      }).valid,
    ).toBe(false));
});
