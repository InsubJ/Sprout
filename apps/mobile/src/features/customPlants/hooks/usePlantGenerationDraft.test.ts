import { parsePlantGenerationDraft } from "./usePlantGenerationDraft";

describe("custom plant prompt draft", () => {
  it("restores prompt text and whether its sheet was open", () => {
    expect(parsePlantGenerationDraft({ open: true, prompt: "A walking moon tree" })).toEqual({
      open: true,
      prompt: "A walking moon tree",
    });
  });

  it("rejects malformed prompt state", () => {
    expect(() => parsePlantGenerationDraft({ open: "yes", prompt: "tree" })).toThrow();
    expect(() => parsePlantGenerationDraft({ open: true, prompt: "x".repeat(1001) })).toThrow();
  });
});
