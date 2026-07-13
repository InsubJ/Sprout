import type { SupabaseClient } from "@supabase/supabase-js";
import { RepositoryError } from "../errors/repositoryError";
import type { StorageRepository, UploadAsset } from "../repositories/storageRepository";
import { toRepositoryError } from "./supabaseFailure";

export class SupabaseStorageRepository implements StorageRepository {
  constructor(private readonly client: SupabaseClient) {
    if (!client) throw new Error("Supabase client is required");
  }
  async uploadReflection(userId: string, asset: UploadAsset): Promise<string> {
    if (!userId.trim() || !asset.uri.trim())
      throw new RepositoryError("User ID and image URI are required", "validation");
    let response: Response;
    try {
      response = await fetch(asset.uri);
    } catch (cause) {
      throw new RepositoryError("Unable to read the selected image", "network", { cause });
    }
    if (!response.ok)
      throw new RepositoryError(
        "Unable to read the selected image",
        response.status >= 500 ? "service_unavailable" : "validation",
      );
    const body = await response.arrayBuffer();
    const extension = asset.fileName?.split(".").pop()?.toLowerCase() || "jpg";
    const stableId = (asset.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(
      /[^a-zA-Z0-9_-]/g,
      "",
    );
    const path = `${userId}/${stableId}.${extension}`;
    const { error } = await this.client.storage
      .from("reflections")
      .upload(path, body, { contentType: asset.mimeType ?? "image/jpeg", upsert: false });
    if (error)
      throw toRepositoryError("Unable to upload image", {
        code: String(error.statusCode ?? ""),
        message: error.message,
      });
    return this.client.storage.from("reflections").getPublicUrl(path).data.publicUrl;
  }
}
