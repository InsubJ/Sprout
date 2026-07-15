import { generationJobKeepsPlantGodActive } from "./generationJobKeepsPlantGodActive";

describe("generationJobKeepsPlantGodActive", () => {
  it.each(["queued", "generating", "preview_ready", "saving", "failed"] as const)(
    "keeps the generation card visible for a %s job",
    (status) => expect(generationJobKeepsPlantGodActive({ status })).toBe(true),
  );

  it.each(["completed", "cancelled"] as const)(
    "allows the Disco plant to return for a %s job",
    (status) => expect(generationJobKeepsPlantGodActive({ status })).toBe(false),
  );
});
