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

  // Webcam States
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    } else {
      // Stop camera if dialog is closed
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setShowCamera(false);
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

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Play video stream when active
  useEffect(() => {
    if (showCamera && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.error('Failed to play video stream:', err);
      });
    }
  }, [showCamera, cameraStream]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err: any) {
      setError('Could not access camera: ' + (err.message || 'please check permissions'));
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `captured_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            stopCamera();
          }
        }, 'image/jpeg', 0.85);
      }
    }
  };

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
      if (activeStorageService) {
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
      } else {
        // Fallback for Mock Mode: Read file as base64 Data URL
        try {
          photoUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (e) => reject(new Error('Failed to read file locally'));
            reader.readAsDataURL(selectedFile);
          });
        } catch (err: any) {
          setError(err instanceof Error ? err.message : 'Local photo processing failed');
          return;
        }
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
          <label className={styles.label}>
            Add a Photo (optional)
          </label>

          <div className={styles.photoActions}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={styles.uploadPhotoBtn}
              disabled={uploading}
              data-testid="log-upload-btn"
            >
              📁 Upload Photo
            </button>
            <button
              type="button"
              onClick={startCamera}
              className={styles.takePhotoBtn}
              disabled={uploading}
              data-testid="log-camera-btn"
            >
              📷 Take Photo
            </button>
          </div>

          <input
            ref={fileInputRef}
            id="log-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            data-testid="log-photo-input"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={uploading}
          />

          {showCamera && (
            <div className={styles.cameraContainer}>
              <video
                ref={videoRef}
                className={styles.webcamVideo}
                playsInline
                muted
              />
              <div className={styles.cameraControls}>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className={styles.captureBtn}
                  data-testid="log-capture-btn"
                >
                  📸 Capture
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className={styles.cancelCameraBtn}
                  data-testid="log-cancel-camera-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

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
