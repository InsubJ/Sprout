import { describe, expect, it } from "vitest";
import { usernameSchema } from "./profileSchema";

describe("usernameSchema", () => {
  it("accepts account usernames supported by the profile contract", () => {
    expect(usernameSchema.parse("sprout_gardener7")).toBe("sprout_gardener7");
  });

  it("rejects usernames that cannot be persisted at account creation", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
    expect(usernameSchema.safeParse("garden friend").success).toBe(false);
    expect(usernameSchema.safeParse("garden-friend").success).toBe(false);
  });
});
