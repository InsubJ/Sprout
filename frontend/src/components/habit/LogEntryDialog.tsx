import React, { useState, useEffect, useRef, useContext } from 'react';
import { Modal } from '../common/Modal';
import { StorageServiceContext } from '../../services/StorageServiceContext';
import { StorageService } from '../../services/storageService';
import styles from './LogEntryDialog.module.css';

export interface LogEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string, photoUrl: string | null) => void | Promise<void>;
  userId?: string;
  habitId?: string;
  storageService?: StorageService;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * LogEntryDialog component prompts users for notes and photo uploads when checking in/watering.
 */
export const LogEntryDialog: React.FC<LogEntryDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userId,
  habitId,
  storageService,
}): React.ReactElement | null => {
  // Preconditions validation (Design by Contract)
  if (typeof isOpen !== 'boolean') {
    throw new Error('Precondition failed: isOpen must be a boolean');
  }
  if (typeof onClose !== 'function') {
    throw new Error('Precondition failed: onClose must be a function');
  }
  if (typeof onSubmit !== 'function') {
    throw new Error('Precondition failed: onSubmit must be a function');
  }

  const contextStorageService = useContext(StorageServiceContext);
  const activeStorageService = storageService || contextStorageService;

  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset states when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  // Clean up object URL when previewUrl changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    
    // File validation
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 5MB limit: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError(`Invalid file type: ${file.type}. Allowed types are JPEG, PNG, WEBP`);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (uploading) return;

    let photoUrl: string | null = null;

    if (selectedFile) {
      if (!activeStorageService) {
        setError('Storage service is not available for upload');
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const timestamp = Date.now();
        const safeFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `${userId || 'anonymous'}/${habitId || 'unknown'}/${timestamp}_${safeFileName}`;
        
        const uploadedPath = await activeStorageService.uploadPhoto(selectedFile, path);
        photoUrl = activeStorageService.getPublicUrl(uploadedPath);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'Photo upload failed');
        setUploading(false);
        return;
      }
    }

    try {
      await onSubmit(description, photoUrl);
      onClose();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Form submission failed');
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Water Habit Check-In">
      <form onSubmit={handleSubmit} className={styles.form} data-testid="log-entry-form">
        <div className={styles.fieldGroup}>
          <label htmlFor="log-description" className={styles.label}>
            Notes / Description (optional)
          </label>
          <textarea
            id="log-description"
            data-testid="log-description-input"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="How is your plant doing today?"
            disabled={uploading}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="log-photo" className={styles.label}>
            Add a Photo (optional)
          </label>
          <input
            ref={fileInputRef}
            id="log-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            data-testid="log-photo-input"
            className={styles.fileInput}
            onChange={handleFileChange}
            disabled={uploading}
          />
          {error && (
            <span className={styles.errorMessage} data-testid="error-message">
              {error}
            </span>
          )}
          {uploading && (
            <div className={styles.uploadStatus} data-testid="uploading-status">
              <div className={styles.spinner} />
              <span>Uploading photo...</span>
            </div>
          )}
          {previewUrl && (
            <div className={styles.previewContainer} data-testid="photo-preview-container">
              <img
                src={previewUrl}
                alt="Preview"
                className={styles.previewImage}
                data-testid="photo-preview"
              />
              <button
                type="button"
                className={styles.removePhotoButton}
                onClick={handleRemovePhoto}
                aria-label="Remove photo"
                data-testid="remove-photo-button"
                disabled={uploading}
              >
                &times;
              </button>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={uploading}
            data-testid="cancel-log-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={uploading}
            data-testid="submit-log-button"
          >
            {uploading ? 'Uploading...' : 'Check In'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
