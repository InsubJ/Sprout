import {
  carouselCardsPerPage,
  carouselIndexFromItemKey,
  carouselIndexFromOffset,
  carouselLastStartIndex,
  carouselPositionLabel,
  carouselStartIndexFromItemIndex,
  carouselUsesManualSettling,
  carouselViewportWidth,
} from "./GardenCarousel";

describe("Garden carousel pager", () => {
  it("reports the sixth plant at the sixth snapped offset", () => {
    expect(carouselIndexFromOffset(5 * 342, 342, 5)).toBe(5);
  });

  it("clamps overscroll to the available starting positions", () => {
    expect(carouselIndexFromOffset(9999, 342, 4)).toBe(4);
    expect(carouselIndexFromOffset(-200, 342, 4)).toBe(0);
  });

  it("settles a partial drag on the nearest complete card", () => {
    expect(carouselIndexFromOffset(0.49 * 342, 342, 5)).toBe(0);
    expect(carouselIndexFromOffset(0.51 * 342, 342, 5)).toBe(1);
  });

  it("restores a carousel item by its stable key", () => {
    const items = [{ id: "first" }, { id: "fifth" }, { id: "disco" }];
    expect(carouselIndexFromItemKey(items, (item) => item.id, "disco")).toBe(2);
  });

  it("falls back to the first item when a saved item is no longer visible", () => {
    expect(carouselIndexFromItemKey([{ id: "first" }], (item) => item.id, "removed")).toBe(0);
  });

  it("shows multiple cards without a leading single-card gap on tablets", () => {
    expect(carouselCardsPerPage(390)).toBe(1);
    expect(carouselCardsPerPage(600)).toBe(2);
    expect(carouselCardsPerPage(768)).toBe(2);
    expect(carouselCardsPerPage(1024)).toBe(3);
  });

  it("uses the rendered container instead of an oversized desktop window", () => {
    expect(carouselViewportWidth(1900, 1120)).toBe(1120);
    expect(carouselCardsPerPage(carouselViewportWidth(1900, 1120))).toBe(4);
  });

  it("does not cancel native momentum by manually settling at drag end", () => {
    expect(carouselUsesManualSettling("android")).toBe(false);
    expect(carouselUsesManualSettling("ios")).toBe(false);
    expect(carouselUsesManualSettling("web")).toBe(true);
  });

  it("allows every overlapping multi-card window", () => {
    expect(carouselLastStartIndex(7, 3)).toBe(4);
    expect(carouselPositionLabel(0, 3, 7)).toBe("1–3 of 7");
    expect(carouselPositionLabel(1, 3, 7)).toBe("2–4 of 7");
    expect(carouselPositionLabel(2, 3, 7)).toBe("3–5 of 7");
    expect(carouselPositionLabel(4, 3, 7)).toBe("5–7 of 7");
  });

  it("allows a four-card window such as 2–5", () => {
    expect(carouselPositionLabel(1, 4, 7)).toBe("2–5 of 7");
  });

  it("clamps a restored final item to the final full window", () => {
    expect(carouselStartIndexFromItemIndex(6, 3, 7)).toBe(4);
  });
});
