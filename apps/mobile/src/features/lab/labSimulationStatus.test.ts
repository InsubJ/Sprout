import { labStatusFromProgress } from "./labSimulationStatus";

describe("Lab simulation status", () => {
  it("uses the selected healthy or withered state below full progress", () => {
    expect(labStatusFromProgress(99, "healthy")).toBe("healthy");
    expect(labStatusFromProgress(99, "withered")).toBe("withered");
  });

  it("automatically completes a plant at 100 percent", () => {
    expect(labStatusFromProgress(100, "healthy")).toBe("completed");
    expect(labStatusFromProgress(100, "withered")).toBe("completed");
  });

  it("rejects progress outside the slider contract", () => {
    expect(() => labStatusFromProgress(-1, "healthy")).toThrow();
    expect(() => labStatusFromProgress(101, "healthy")).toThrow();
  });
});
