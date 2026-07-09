import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import styles from './WaterConfirmModal.module.css';

interface WaterConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string, imageUrl?: string) => void;
  plantName: string;
}

export const WaterConfirmModal: React.FC<WaterConfirmModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  plantName,
}) => {
  const [note, setNote] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = () => {
    setImageUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(note, imageUrl);
    // Reset state
    setNote('');
    setImageUrl(undefined);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Water ${plantName}`}>
      <form onSubmit={handleSubmit} className={styles.waterForm}>
        <p className={styles.prompt}>
          Nurture your plant with a daily reflection. Capture a thought or upload a progress photo.
        </p>

        <div className={styles.formGroup}>
          <label htmlFor="reflection-note" className={styles.label}>
            Reflection Note
          </label>
          <textarea
            id="reflection-note"
            value={note}
            onChange={handleTextChange}
            placeholder="How did you go with this habit today? Any insights or feelings?"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <span className={styles.label}>Progress Photo</span>
          
          {imageUrl ? (
            <div className={styles.previewContainer}>
              <img src={imageUrl} alt="Progress Preview" className={styles.previewImage} />
              <button
                type="button"
                onClick={handleClearImage}
                className={styles.clearImageBtn}
                title="Remove photo"
              >
                ✕ Remove Photo
              </button>
            </div>
          ) : (
            <div
              className={`${styles.dragZone} ${dragActive ? styles.dragZoneActive : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={handleButtonClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              <span className={styles.uploadIcon}>📷</span>
              <p className={styles.uploadText}>
                <strong>Click to upload</strong> or drag & drop a photo
              </p>
              <p className={styles.uploadSubtext}>PNG, JPG or WEBP up to 5MB</p>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn}>
            Water Plant 💧
          </button>
        </div>
      </form>
    </Modal>
  );
};
