import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SupabaseStorageRepository } from "./supabaseStorageRepository";

function storageClient() {
  const upload = vi.fn(async () => ({ error: null }));
  const getPublicUrl = vi.fn((path: string) => ({
    data: { publicUrl: `https://storage.example/${path}` },
  }));
  const from = vi.fn(() => ({ upload, getPublicUrl }));
  return {
    client: { storage: { from } } as unknown as SupabaseClient,
    from,
    upload,
    getPublicUrl,
  };
}

describe("SupabaseStorageRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uploads reflections to the configured habit photo bucket", async () => {
    const fake = storageClient();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(new Uint8Array([1, 2, 3]))),
    );
    const repository = new SupabaseStorageRepository(fake.client);

    const url = await repository.uploadReflection("user-1", {
      uri: "blob:reflection",
      id: "operation-1",
      fileName: "reflection.jpg",
      mimeType: "image/jpeg",
    });

    expect(fake.from).toHaveBeenCalledWith("habit-photos");
    expect(fake.upload).toHaveBeenCalledWith(
      "user-1/reflections/operation-1.jpg",
      expect.any(ArrayBuffer),
      { contentType: "image/jpeg", upsert: false },
    );
    expect(url).toBe("https://storage.example/user-1/reflections/operation-1.jpg");
  });

  it("upserts a stable avatar path and cache-busts its public URL", async () => {
    const fake = storageClient();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(new Uint8Array([1, 2, 3]))),
    );
    vi.spyOn(Date, "now").mockReturnValue(1234);
    const repository = new SupabaseStorageRepository(fake.client);

    const url = await repository.uploadProfileAvatar("user-1", {
      uri: "blob:avatar",
      fileName: "avatar.jpg",
      mimeType: "image/jpeg",
    });

    expect(fake.upload).toHaveBeenCalledWith("user-1/avatars/avatar.jpg", expect.any(ArrayBuffer), {
      contentType: "image/jpeg",
      upsert: true,
    });
    expect(url).toBe("https://storage.example/user-1/avatars/avatar.jpg?v=1234");
  });
});
