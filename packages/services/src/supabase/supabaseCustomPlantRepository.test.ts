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
