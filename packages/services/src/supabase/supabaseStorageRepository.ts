import type { SupabaseClient } from "@supabase/supabase-js";
import { RepositoryError } from "../errors/repositoryError";
import type { StorageRepository, UploadAsset } from "../repositories/storageRepository";
import { toRepositoryError } from "./supabaseFailure";

const USER_MEDIA_BUCKET = "habit-photos";

export class SupabaseStorageRepository implements StorageRepository {
  constructor(private readonly client: SupabaseClient) {
    if (!client) throw new Error("Supabase client is required");
  }
  async uploadReflection(userId: string, asset: UploadAsset): Promise<string> {
    const stableId = this.assetId(asset);
    const extension = this.extension(asset);
    return this.upload(userId, asset, `${userId}/reflections/${stableId}.${extension}`, false);
  }
  async uploadProfileAvatar(userId: string, asset: UploadAsset): Promise<string> {
    const extension = this.extension(asset);
    const url = await this.upload(userId, asset, `${userId}/avatars/avatar.${extension}`, true);
    return `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
  }
  private async upload(
    userId: string,
    asset: UploadAsset,
    path: string,
    upsert: boolean,
  ): Promise<string> {
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
    const { error } = await this.client.storage
      .from(USER_MEDIA_BUCKET)
      .upload(path, body, { contentType: asset.mimeType ?? "image/jpeg", upsert });
    if (error)
      throw toRepositoryError("Unable to upload image", {
        code: String(error.statusCode ?? ""),
        message: error.message,
      });
    return this.client.storage.from(USER_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  }
  private extension(asset: UploadAsset): string {
    return (
      asset.fileName
        ?.split(".")
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "") || "jpg"
    );
  }
  private assetId(asset: UploadAsset): string {
    return (asset.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(
      /[^a-zA-Z0-9_-]/g,
      "",
    );
  }
}
