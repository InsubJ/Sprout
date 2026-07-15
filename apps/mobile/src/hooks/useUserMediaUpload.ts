import { useCallback } from "react";
import { isRetryableRepositoryError, type UploadAsset } from "@sprout/services";
import { useAuth } from "../providers/AuthProvider";
import { useServices } from "../providers/ServicesProvider";

export interface UserMediaUploadState {
  userId?: string;
  uploadReflection: (
    asset: UploadAsset,
  ) => Promise<{ imageUrl?: string; pendingAsset?: UploadAsset }>;
  uploadAvatar: (asset: UploadAsset) => Promise<string>;
}
export function useUserMediaUpload(): UserMediaUploadState {
  const { user } = useAuth();
  const { storage, isDemo } = useServices();
  const uploadReflection = useCallback(
    async (asset: UploadAsset): Promise<{ imageUrl?: string; pendingAsset?: UploadAsset }> => {
      if (!user) throw new Error("Sign in before uploading an image");
      if (storage) {
        try {
          return { imageUrl: await storage.uploadReflection(user.id, asset) };
        } catch (cause) {
          if (!isRetryableRepositoryError(cause)) throw cause;
          return { pendingAsset: asset };
        }
      }
      if (isDemo) return { imageUrl: asset.uri };
      return { pendingAsset: asset };
    },
    [isDemo, storage, user],
  );
  const uploadAvatar = useCallback(
    async (asset: UploadAsset): Promise<string> => {
      if (!user) throw new Error("Sign in before uploading an avatar");
      if (storage) return storage.uploadProfileAvatar(user.id, asset);
      if (isDemo) return asset.uri;
      throw new Error("Avatar storage is unavailable");
    },
    [isDemo, storage, user],
  );
  return { userId: user?.id, uploadReflection, uploadAvatar };
}
