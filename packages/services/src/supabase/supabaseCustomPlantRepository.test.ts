import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "./database.types";
import { SupabaseCustomPlantRepository } from "./supabaseCustomPlantRepository";

function deletionClient(result: { data: { id: string } | null; error: Error | null }) {
  const maybeSingle = vi.fn(async () => result);
  const select = vi.fn(() => ({ maybeSingle }));
  const eq = vi.fn(() => ({ select }));
  const deleteRows = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ delete: deleteRows }));
  const client = { from } as unknown as SupabaseClient<Database>;
  return { client, deleteRows, eq, select, maybeSingle };
}

function visibilityClient() {
  const order = vi.fn(async () => ({ data: [], error: null }));
  const query = { eq: vi.fn(), is: vi.fn(), order };
  query.eq.mockReturnValue(query);
  query.is.mockReturnValue(query);
  const select = vi.fn(() => query);
  const from = vi.fn(() => ({ select }));
  const client = { from } as unknown as SupabaseClient<Database>;
  return { client, eq: query.eq, is: query.is, order };
}

describe("SupabaseCustomPlantRepository friend visibility", () => {
  it("explicitly requests only friend-visible plants for the selected owner", async () => {
    const fake = visibilityClient();
    const repository = new SupabaseCustomPlantRepository(fake.client);

    await repository.getVisibleForUser("friend-1");

    expect(fake.eq).toHaveBeenNthCalledWith(1, "user_id", "friend-1");
    expect(fake.eq).toHaveBeenNthCalledWith(2, "visibility", "friends");
    expect(fake.is).toHaveBeenCalledWith("archived_at", null);
  });
});

describe("SupabaseCustomPlantRepository deletion", () => {
  it("deletes exactly the requested custom plant", async () => {
    const fake = deletionClient({ data: { id: "plant-1" }, error: null });
    const repository = new SupabaseCustomPlantRepository(fake.client);

    await repository.deleteById("plant-1");

    expect(fake.deleteRows).toHaveBeenCalledTimes(1);
    expect(fake.eq).toHaveBeenCalledWith("id", "plant-1");
    expect(fake.select).toHaveBeenCalledWith("id");
  });

  it("rejects an empty plant ID before querying Supabase", async () => {
    const fake = deletionClient({ data: null, error: null });
    const repository = new SupabaseCustomPlantRepository(fake.client);

    await expect(repository.deleteById("")).rejects.toThrow("Plant ID is required");
    expect(fake.deleteRows).not.toHaveBeenCalled();
  });

  it("reports when ownership rules prevent deletion", async () => {
    const fake = deletionClient({ data: null, error: null });
    const repository = new SupabaseCustomPlantRepository(fake.client);

    await expect(repository.deleteById("plant-1")).rejects.toThrow(
      "Custom plant was not found or could not be deleted",
    );
  });
});
