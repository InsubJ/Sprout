import { createCarouselPositionStore, parseCarouselPositions } from "./CarouselPositionProvider";

describe("Carousel position store", () => {
  it("remembers positions independently for each page", () => {
    const store = createCarouselPositionStore();
    store.write("forest:user-1", "disco");
    store.write("sanctuary:user-1", "custom-plant-5");

    expect(store.read("forest:user-1")).toBe("disco");
    expect(store.read("sanctuary:user-1")).toBe("custom-plant-5");
  });

  it("rejects empty identifiers at the state boundary", () => {
    const store = createCarouselPositionStore();
    expect(() => store.write("", "plant-1")).toThrow(
      "Carousel and item identifiers must not be empty",
    );
    expect(() => store.write("forest:user-1", "")).toThrow(
      "Carousel and item identifiers must not be empty",
    );
  });

  it("hydrates valid saved positions and ignores malformed entries", () => {
    const parsed = parseCarouselPositions({
      "forest:user-1": "disco",
      "sanctuary:user-1": "",
      invalid: 42,
    });
    const store = createCarouselPositionStore(parsed);
    expect(store.read("forest:user-1")).toBe("disco");
    expect(store.read("sanctuary:user-1")).toBeNull();
    expect(store.read("invalid")).toBeNull();
  });

  it("publishes a persistence snapshot when a position changes", () => {
    const onChange = jest.fn();
    const store = createCarouselPositionStore({}, onChange);
    store.write("forest:user-1", "plant-5");
    expect(onChange).toHaveBeenCalledWith({ "forest:user-1": "plant-5" });
  });
});
