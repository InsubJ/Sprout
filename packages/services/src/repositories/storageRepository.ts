export interface UploadAsset {
  uri: string;
  mimeType?: string;
  fileName?: string;
  id?: string;
}
export interface StorageRepository {
  uploadReflection(userId: string, asset: UploadAsset): Promise<string>;
  uploadProfileAvatar(userId: string, asset: UploadAsset): Promise<string>;
}
