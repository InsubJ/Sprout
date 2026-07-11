import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  StorageService,
  StorageValidationError,
  StorageDatabaseError
} from '../services/storageService';

describe('StorageService', () => {
  let mockStorageFrom: any;
  let mockSupabase: any;
  let service: StorageService;

  beforeEach(() => {
    mockStorageFrom = {
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
      delete: vi.fn()
    };
    mockSupabase = {
      storage: {
        from: vi.fn().mockReturnValue(mockStorageFrom)
      }
    };
    service = new StorageService(mockSupabase);
  });

  describe('Constructor', () => {
    it('should throw error if supabase client is not provided', () => {
      expect(() => new StorageService(null as any)).toThrow('Supabase client is required');
    });
  });

  describe('File Validation', () => {
    it('should allow valid files (under 5MB and correct type)', async () => {
      const validFile = new File([new ArrayBuffer(1024)], 'test.png', { type: 'image/png' });
      mockStorageFrom.upload.mockResolvedValue({ data: { path: 'userId/test.png' }, error: null });

      const result = await service.uploadPhoto(validFile, 'userId/test.png');
      expect(result).toBe('userId/test.png');
    });

    it('should throw StorageValidationError if file size exceeds 5MB', async () => {
      // 5MB + 1 byte
      const largeFile = new File([new ArrayBuffer(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' });
      
      await expect(service.uploadPhoto(largeFile, 'userId/large.png')).rejects.toThrow(StorageValidationError);
      await expect(service.uploadPhoto(largeFile, 'userId/large.png')).rejects.toThrow('File size exceeds 5MB limit');
    });

    it('should throw StorageValidationError if file type is invalid', async () => {
      const invalidFile = new File([new ArrayBuffer(1024)], 'test.gif', { type: 'image/gif' });
      
      await expect(service.uploadPhoto(invalidFile, 'userId/test.gif')).rejects.toThrow(StorageValidationError);
      await expect(service.uploadPhoto(invalidFile, 'userId/test.gif')).rejects.toThrow('Invalid file type');
    });
  });

  describe('uploadPhoto', () => {
    const validFile = new File([new ArrayBuffer(1024)], 'photo.jpg', { type: 'image/jpeg' });

    it('should upload photo successfully and return path', async () => {
      mockStorageFrom.upload.mockResolvedValue({
        data: { path: 'userId/photo.jpg' },
        error: null
      });

      const result = await service.uploadPhoto(validFile, 'userId/photo.jpg');

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('habit-photos');
      expect(mockStorageFrom.upload).toHaveBeenCalledWith('userId/photo.jpg', validFile, {
        cacheControl: '3600',
        upsert: true
      });
      expect(result).toBe('userId/photo.jpg');
    });

    it('should throw StorageValidationError if upload path is empty', async () => {
      await expect(service.uploadPhoto(validFile, '')).rejects.toThrow(StorageValidationError);
      await expect(service.uploadPhoto(validFile, '   ')).rejects.toThrow(StorageValidationError);
    });

    it('should throw StorageDatabaseError if Supabase returns an error', async () => {
      mockStorageFrom.upload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' }
      });

      await expect(service.uploadPhoto(validFile, 'userId/photo.jpg')).rejects.toThrow(StorageDatabaseError);
      await expect(service.uploadPhoto(validFile, 'userId/photo.jpg')).rejects.toThrow('Failed to upload photo: Upload failed');
    });

    it('should throw StorageDatabaseError if data path is missing', async () => {
      mockStorageFrom.upload.mockResolvedValue({
        data: {},
        error: null
      });

      await expect(service.uploadPhoto(validFile, 'userId/photo.jpg')).rejects.toThrow(StorageDatabaseError);
    });
  });

  describe('getPublicUrl', () => {
    it('should get public URL successfully', () => {
      mockStorageFrom.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/storage/v1/object/public/habit-photos/userId/photo.jpg' }
      });

      const result = service.getPublicUrl('userId/photo.jpg');

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('habit-photos');
      expect(mockStorageFrom.getPublicUrl).toHaveBeenCalledWith('userId/photo.jpg');
      expect(result).toBe('https://example.com/storage/v1/object/public/habit-photos/userId/photo.jpg');
    });

    it('should throw StorageValidationError if path is empty', () => {
      expect(() => service.getPublicUrl('')).toThrow(StorageValidationError);
    });

    it('should throw StorageDatabaseError if publicUrl is not returned', () => {
      mockStorageFrom.getPublicUrl.mockReturnValue({
        data: {}
      });

      expect(() => service.getPublicUrl('userId/photo.jpg')).toThrow(StorageDatabaseError);
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo successfully', async () => {
      mockStorageFrom.delete.mockResolvedValue({
        data: ['userId/photo.jpg'],
        error: null
      });

      await service.deletePhoto('userId/photo.jpg');

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('habit-photos');
      expect(mockStorageFrom.delete).toHaveBeenCalledWith(['userId/photo.jpg']);
    });

    it('should throw StorageValidationError if path is empty', async () => {
      await expect(service.deletePhoto('')).rejects.toThrow(StorageValidationError);
    });

    it('should throw StorageDatabaseError if Supabase returns an error', async () => {
      mockStorageFrom.delete.mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' }
      });

      await expect(service.deletePhoto('userId/photo.jpg')).rejects.toThrow(StorageDatabaseError);
    });
  });
});
