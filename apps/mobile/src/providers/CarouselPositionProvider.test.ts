import { createCarouselPositionStore } from "./CarouselPositionProvider";

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

  it("starts empty again when the app creates a new in-memory store", () => {
    const firstSession = createCarouselPositionStore();
    firstSession.write("forest:user-1", "plant-5");
    expect(createCarouselPositionStore().read("forest:user-1")).toBeNull();
  });
});
