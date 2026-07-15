import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { SupabaseSocialRepository } from "./supabaseSocialRepository";

function cancellationClient(data: { id: string } | null) {
  const maybeSingle = vi.fn(async () => ({ data, error: null }));
  const select = vi.fn(() => ({ maybeSingle }));
  const eq = vi.fn(() => query);
  const query = { eq, select };
  const deleteRows = vi.fn(() => query);
  const from = vi.fn(() => ({ delete: deleteRows }));
  const client = { from } as unknown as SupabaseClient;
  return { client, from, deleteRows, eq, select };
}

describe("SupabaseSocialRepository outgoing cancellation", () => {
  it("deletes only the requester's pending request", async () => {
    const fake = cancellationClient({ id: "request-1" });
    const repository = new SupabaseSocialRepository(fake.client);

    await repository.cancelFriendRequest("request-1", "requester-1");

    expect(fake.eq).toHaveBeenNthCalledWith(1, "id", "request-1");
    expect(fake.eq).toHaveBeenNthCalledWith(2, "user_id", "requester-1");
    expect(fake.eq).toHaveBeenNthCalledWith(3, "status", "pending");
    expect(fake.select).toHaveBeenCalledWith("id");
  });

  it("reports when the pending outgoing request is unavailable", async () => {
    const fake = cancellationClient(null);
    const repository = new SupabaseSocialRepository(fake.client);

    await expect(repository.cancelFriendRequest("request-1", "requester-1")).rejects.toMatchObject({
      category: "not_found",
    });
  });
});
