import { shouldAnimateDiscoEnergy } from "./DiscoEnergyBar";
describe("Disco energy animation", () => {
  it("keeps animating at full energy after dancing mode ends", () => {
    expect(shouldAnimateDiscoEnergy(1, false)).toBe(true);
  });
  it("does not animate a partial inactive bar", () => {
    expect(shouldAnimateDiscoEnergy(0.75, false)).toBe(false);
  });
  it("animates while the Disco Plant is dancing", () => {
    expect(shouldAnimateDiscoEnergy(0.4, true)).toBe(true);
  });
});
