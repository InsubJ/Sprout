import { carouselIndexFromOffset } from "./GardenCarousel";
describe("Garden carousel pager", () => {
  it("reports the sixth plant at the sixth snapped offset", () => {
    expect(carouselIndexFromOffset(5 * 342, 342, 5)).toBe(5);
  });
  it("clamps overscroll to the available plants", () => {
    expect(carouselIndexFromOffset(9999, 342, 5)).toBe(5);
    expect(carouselIndexFromOffset(-200, 342, 5)).toBe(0);
  });
});
