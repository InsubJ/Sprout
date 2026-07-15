import type { Profile } from "@sprout/shared";
import { requiresUsernameOnboarding } from "./useUsernameOnboarding";

const profile: Profile = {
  id: "11111111-1111-1111-1111-111111111111",
  username: "user_11111111-111",
  display_name: null,
  avatar_url: null,
  created_at: "2026-07-13T00:00:00.000Z",
};

describe("requiresUsernameOnboarding", () => {
  it("requires a one-time choice for an OAuth placeholder username", () => {
    expect(requiresUsernameOnboarding({ ...profile, username_set_at: null })).toBe(true);
  });

  it("does not reopen onboarding after the username has been set", () => {
    expect(
      requiresUsernameOnboarding({ ...profile, username_set_at: "2026-07-13T01:00:00.000Z" }),
    ).toBe(false);
  });
});
