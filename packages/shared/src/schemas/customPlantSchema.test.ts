import { describe, expect, it } from "vitest";
import { customPlantSchema } from "./customPlantSchema";

const plant = {
  id: "10000000-0000-4000-8000-000000000001",
  userId: "10000000-0000-4000-8000-000000000002",
  displayName: "Moon Fern",
  originalPrompt: "A moonlit fern",
  sanitizedPrompt: "A moonlit fern",
  description: "A quiet moonlit fern.",
  plantSpec: {
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
  },
  renderVersion: 1,
  rarity: "custom",
  generationJobId: "10000000-0000-4000-8000-000000000003",
  previewImageUrl: null,
  visibility: "friends",
  createdAt: "2026-07-13T04:47:51.123456+00:00",
  updatedAt: "2026-07-13T14:47:51.123456+10:00",
  archivedAt: null,
};

describe("custom plant schema", () => {
  it("accepts timezone-aware PostgreSQL timestamps", () => {
    expect(customPlantSchema.parse(plant)).toMatchObject({
      createdAt: plant.createdAt,
      updatedAt: plant.updatedAt,
    });
  });
});
