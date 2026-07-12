import * as ImageManipulator from 'expo-image-manipulator';
import type { UploadAsset } from '@sprout/services';
export async function prepareUploadAsset(uri: string, operationId: string): Promise<UploadAsset> {
  if (!uri.trim() || !operationId.trim()) throw new Error('Image URI and operation ID are required');
  const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1440 } }], { compress: .72, format: ImageManipulator.SaveFormat.JPEG });
  return { uri: result.uri, mimeType: 'image/jpeg', fileName: `${operationId}.jpg`, id: operationId };
}
