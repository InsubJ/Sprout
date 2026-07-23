import { parseWaterReflectionDraft } from "./useWaterReflectionDraft";

describe("watering reflection draft", () => {
  it("restores a valid unfinished reflection", () => {
    expect(
      parseWaterReflectionDraft({
        habitId: "habit-1",
        note: "A useful thought",
        imageUri: "file:///reflection.jpg",
      }),
    ).toEqual({
      habitId: null,
      note: "A useful thought",
      imageUri: "file:///reflection.jpg",
    });
  });

  it("rejects malformed or oversized drafts", () => {
    expect(() => parseWaterReflectionDraft({ habitId: 2, note: "", imageUri: null })).toThrow();
    expect(() =>
      parseWaterReflectionDraft({ habitId: "habit-1", note: "x".repeat(501), imageUri: null }),
    ).toThrow();
  });
});
