import { SupabaseClient } from '@supabase/supabase-js';

export class StorageServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageServiceError';
  }
}

export class StorageValidationError extends StorageServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'StorageValidationError';
  }
}

export class StorageDatabaseError extends StorageServiceError {
  public originalError: any;
  constructor(message: string, originalError?: any) {
    super(message);
    this.name = 'StorageDatabaseError';
    this.originalError = originalError;
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKET_NAME = 'habit-photos';

export class StorageService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    if (!supabaseClient) {
      throw new Error('Supabase client is required');
    }
    this.supabase = supabaseClient;
  }

  /**
   * Validates file size and type.
   * @param file The file to validate.
   * @throws StorageValidationError if file is invalid.
   */
  private validateFile(file: File): void {
    if (!file) {
      throw new StorageValidationError('File is required');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new StorageValidationError(`File size exceeds 5MB limit: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new StorageValidationError(`Invalid file type: ${file.type}. Allowed types are JPEG, PNG, WEBP`);
    }
  }

  /**
   * Uploads a photo to Supabase storage bucket.
   * @param file The file to upload.
   * @param path The destination path inside the bucket (e.g. "userId/filename.jpg").
   * @returns A promise that resolves to the uploaded file path.
   * @throws StorageValidationError if file validation or inputs fail.
   * @throws StorageDatabaseError if the upload operation fails.
   */
  async uploadPhoto(file: File, path: string): Promise<string> {
    if (!path || typeof path !== 'string' || path.trim() === '') {
      throw new StorageValidationError('Upload path must be a non-empty string');
    }

    this.validateFile(file);

    const { data, error } = await this.supabase.storage
      .from(BUCKET_NAME)
      .upload(path.trim(), file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw new StorageDatabaseError(`Failed to upload photo: ${error.message}`, error);
    }

    if (!data || !data.path) {
      throw new StorageDatabaseError('Upload completed but path was not returned');
    }

    return data.path;
  }

  /**
   * Retrieves the public URL of a photo.
   * @param path The file path inside the bucket.
   * @returns The public URL string.
   * @throws StorageValidationError if path is invalid.
   */
  getPublicUrl(path: string): string {
    if (!path || typeof path !== 'string' || path.trim() === '') {
      throw new StorageValidationError('Path must be a non-empty string');
    }

    const { data } = this.supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path.trim());

    if (!data || !data.publicUrl) {
      throw new StorageDatabaseError('Failed to retrieve public URL');
    }

    return data.publicUrl;
  }

  /**
   * Deletes a photo from the Supabase storage bucket.
   * @param path The file path inside the bucket.
   * @throws StorageValidationError if path is invalid.
   * @throws StorageDatabaseError if the delete operation fails.
   */
  async deletePhoto(path: string): Promise<void> {
    if (!path || typeof path !== 'string' || path.trim() === '') {
      throw new StorageValidationError('Path must be a non-empty string');
    }

    const { data, error } = await (this.supabase.storage
      .from(BUCKET_NAME) as any)
      .delete([path.trim()]);

    if (error) {
      throw new StorageDatabaseError(`Failed to delete photo: ${error.message}`, error);
    }
  }
}
