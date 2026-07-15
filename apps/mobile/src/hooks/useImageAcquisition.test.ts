import { imagePickerRequiresPermission } from "./useImageAcquisition";

describe("image picker permission timing", () => {
  it("launches immediately from a web tap without awaiting a permission request", () => {
    expect(imagePickerRequiresPermission("web")).toBe(false);
  });

  it.each(["ios", "android"])("requests permission before launching on %s", (platform) => {
    expect(imagePickerRequiresPermission(platform)).toBe(true);
  });
});
