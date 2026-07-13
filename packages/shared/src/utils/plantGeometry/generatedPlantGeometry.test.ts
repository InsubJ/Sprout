import { describe, expect, it } from "vitest";
import type { GeneratedPlantLayer } from "../../types/customPlant";
import {
  computeGeneratedFoliage,
  computeGeneratedTree,
  resolveGeneratedLeafShape,
} from "./generatedPlantGeometry";

const layer = (overrides: Partial<GeneratedPlantLayer>): GeneratedPlantLayer => ({
  type: "radial_leaf",
  geometry: "oval",
  anchor: { x: 200, y: 190 },
  scale: 1,
  rotation: 0,
  count: 7,
  fill: "#4F8A4B",
  zIndex: 10,
  ...overrides,
});

describe("generated plant geometry", () => {
  it("expands one tree instruction into branches and a substantial canopy", () => {
    const geometry = computeGeneratedTree(
      layer({ type: "tree", geometry: "eucalyptus", anchor: { x: 210, y: 100 } }),
    );

    expect(geometry.branches).toHaveLength(7);
    expect(geometry.canopyLeaves.length).toBeGreaterThanOrEqual(26);
    expect(geometry.translationX).toBe(10);
    expect(geometry.scale).toBe(1.15);
    expect(geometry.leafShape).toBe("eucalyptus");
  });

  it("normalizes sparse legacy tree instructions into card-sized geometry", () => {
    const geometry = computeGeneratedTree(
      layer({ type: "tree", anchor: { x: 350, y: 280 }, scale: 0.3, count: 1 }),
    );

    expect(geometry.topY).toBe(145);
    expect(geometry.translationX).toBe(35);
    expect(geometry.scale).toBe(1.15);
    expect(geometry.branches).toHaveLength(6);
  });

  it("fans foliage upward instead of arranging leaf ellipses around a full circle", () => {
    const leaves = computeGeneratedFoliage(layer({ type: "radial_leaf", count: 9 }));

    expect(leaves).toHaveLength(9);
    expect(leaves.every((leaf) => leaf.y <= 190)).toBe(true);
    expect(Math.min(...leaves.map((leaf) => leaf.x))).toBeLessThan(180);
    expect(Math.max(...leaves.map((leaf) => leaf.x))).toBeGreaterThan(220);
  });

  it("maps native geometry labels to recognisable leaf silhouettes", () => {
    expect(resolveGeneratedLeafShape("willow", "radial_leaf")).toBe("lanceolate");
    expect(resolveGeneratedLeafShape("pothos", "pothos_leaf")).toBe("heart");
    expect(resolveGeneratedLeafShape("pine", "radial_leaf")).toBe("needle");
  });
});
