import type { Profile } from "@sprout/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { SupabaseProfileRepository } from "./supabaseProfileRepository";

function profileUpdateClient(profile: Profile) {
  const single = vi.fn(async () => ({ data: profile, error: null }));
  const select = vi.fn(() => ({ single }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn((_values: Record<string, unknown>) => ({ eq }));
  const from = vi.fn(() => ({ update }));
  return { client: { from } as unknown as SupabaseClient, update };
}

describe("SupabaseProfileRepository updates", () => {
  it("sends an OAuth user's one-time username choice", async () => {
    const profile: Profile = {
      id: "11111111-1111-1111-1111-111111111111",
      username: "chosen_name",
      display_name: null,
      avatar_url: null,
      created_at: "2026-07-13T00:00:00.000Z",
      username_set_at: "2026-07-13T01:00:00.000Z",
    };
    const fake = profileUpdateClient(profile);
    const repository = new SupabaseProfileRepository(fake.client);

    await repository.setInitialUsername(profile.id, "chosen_name");

    expect(fake.update).toHaveBeenCalledWith({ username: "chosen_name" });
  });

  it("updates editable profile fields without sending the immutable username", async () => {
    const profile: Profile = {
      id: "11111111-1111-1111-1111-111111111111",
      username: "permanent_name",
      display_name: "New display name",
      avatar_url: null,
      created_at: "2026-07-13T00:00:00.000Z",
    };
    const fake = profileUpdateClient(profile);
    const repository = new SupabaseProfileRepository(fake.client);

    await repository.update({
      id: profile.id,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
    });

    expect(fake.update).toHaveBeenCalledWith({
      display_name: "New display name",
      avatar_url: null,
    });
    expect(fake.update.mock.calls[0]?.[0]).not.toHaveProperty("username");
  });
});
