import { useCallback } from "react";
import { isRetryableRepositoryError, type UploadAsset } from "@sprout/services";
import { useAuth } from "../providers/AuthProvider";
import { useServices } from "../providers/ServicesProvider";

export interface UserMediaUploadState {
  userId?: string;
  upload: (asset: UploadAsset) => Promise<{ imageUrl?: string; pendingAsset?: UploadAsset }>;
}
export function useUserMediaUpload(): UserMediaUploadState {
  const { user } = useAuth();
  const { storage, isDemo } = useServices();
  const upload = useCallback(
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
  return { userId: user?.id, upload };
}
