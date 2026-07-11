// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { LogEntryDialog } from '../components/habit/LogEntryDialog';

describe('LogEntryDialog Component', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  let mockStorageService: any;
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    mockStorageService = {
      uploadPhoto: vi.fn().mockResolvedValue('mock-uploaded-path'),
      getPublicUrl: vi.fn().mockReturnValue('https://example.com/mock-photo.jpg'),
      deletePhoto: vi.fn().mockResolvedValue(undefined),
    };

    mockOnSubmit.mockClear();
    mockOnClose.mockClear();

    // Mock URL utilities for image previews
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-preview-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    if (container) {
      document.body.removeChild(container);
    }
    container = null;
    root = null;
  });

  const renderComponent = (props: any) => {
    const defaultProps = {
      isOpen: true,
      onClose: mockOnClose,
      onSubmit: mockOnSubmit,
      userId: 'user-123',
      habitId: 'habit-456',
      storageService: mockStorageService,
    };
    act(() => {
      root.render(React.createElement(LogEntryDialog, { ...defaultProps, ...props }));
    });
  };

  const changeTextareaValue = (textarea: HTMLTextAreaElement, value: string) => {
    const prototype = Object.getPrototypeOf(textarea);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(textarea, value);
    } else {
      textarea.value = value;
    }
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  };

  it('renders all fields and buttons when isOpen is true', () => {
    renderComponent({ isOpen: true });

    const form = document.querySelector('[data-testid="log-entry-form"]');
    const descTextarea = document.getElementById('log-description');
    const fileInput = document.getElementById('log-photo');
    const cancelBtn = document.querySelector('[data-testid="cancel-log-button"]');
    const submitBtn = document.querySelector('[data-testid="submit-log-button"]');

    expect(form).toBeTruthy();
    expect(descTextarea).toBeTruthy();
    expect(fileInput).toBeTruthy();
    expect(cancelBtn).toBeTruthy();
    expect(submitBtn).toBeTruthy();
    expect(submitBtn?.textContent).toBe('Check In');
  });

  it('does not render anything when isOpen is false', () => {
    renderComponent({ isOpen: false });

    const form = document.querySelector('[data-testid="log-entry-form"]');
    expect(form).toBeNull();
  });

  it('allows typing into the description textarea', () => {
    renderComponent({ isOpen: true });

    const descTextarea = document.getElementById('log-description') as HTMLTextAreaElement;
    act(() => {
      changeTextareaValue(descTextarea, 'My plant is growing green and healthy!');
    });

    expect(descTextarea.value).toBe('My plant is growing green and healthy!');
  });

  it('validates file size (rejects files > 5MB)', () => {
    renderComponent({ isOpen: true });

    const fileInput = document.getElementById('log-photo') as HTMLInputElement;

    // Create a mock file larger than 5MB
    const file = new File([''], 'large.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 });

    act(() => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const errorMsg = document.querySelector('[data-testid="error-message"]');
    expect(errorMsg).toBeTruthy();
    expect(errorMsg?.textContent).toContain('File size exceeds 5MB limit');

    const previewContainer = document.querySelector('[data-testid="photo-preview-container"]');
    expect(previewContainer).toBeNull();
  });

  it('validates file type (rejects non-image or unsupported formats)', () => {
    renderComponent({ isOpen: true });

    const fileInput = document.getElementById('log-photo') as HTMLInputElement;

    // Create an unsupported mock file format (e.g. text/plain)
    const file = new File([''], 'doc.txt', { type: 'text/plain' });

    act(() => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const errorMsg = document.querySelector('[data-testid="error-message"]');
    expect(errorMsg).toBeTruthy();
    expect(errorMsg?.textContent).toContain('Invalid file type');

    const previewContainer = document.querySelector('[data-testid="photo-preview-container"]');
    expect(previewContainer).toBeNull();
  });

  it('displays a preview image when a valid file is selected', () => {
    renderComponent({ isOpen: true });

    const fileInput = document.getElementById('log-photo') as HTMLInputElement;

    const file = new File([''], 'plant.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

    act(() => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const errorMsg = document.querySelector('[data-testid="error-message"]');
    expect(errorMsg).toBeNull();

    const previewContainer = document.querySelector('[data-testid="photo-preview-container"]');
    expect(previewContainer).toBeTruthy();

    const previewImage = document.querySelector('[data-testid="photo-preview"]') as HTMLImageElement;
    expect(previewImage).toBeTruthy();
    expect(previewImage.src).toBe('blob:mock-preview-url');
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it('removes selected file and preview when clicking remove photo button', () => {
    renderComponent({ isOpen: true });

    const fileInput = document.getElementById('log-photo') as HTMLInputElement;
    const file = new File([''], 'plant.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 });

    act(() => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const removeBtn = document.querySelector('[data-testid="remove-photo-button"]') as HTMLButtonElement;
    expect(removeBtn).toBeTruthy();

    act(() => {
      removeBtn.click();
    });

    const previewContainer = document.querySelector('[data-testid="photo-preview-container"]');
    expect(previewContainer).toBeNull();
    expect(fileInput.value).toBe('');
  });

  it('calls onClose when cancel button is clicked', () => {
    renderComponent({ isOpen: true });

    const cancelBtn = document.querySelector('[data-testid="cancel-log-button"]') as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();

    act(() => {
      cancelBtn.click();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('submits successfully without photo', async () => {
    renderComponent({ isOpen: true });

    const descTextarea = document.getElementById('log-description') as HTMLTextAreaElement;
    const form = document.querySelector('[data-testid="log-entry-form"]') as HTMLFormElement;

    act(() => {
      changeTextareaValue(descTextarea, 'Just watered the rose plant!');
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    expect(mockStorageService.uploadPhoto).not.toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalledWith('Just watered the rose plant!', null);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('uploads photo and submits successfully with valid photo selection', async () => {
    renderComponent({ isOpen: true });

    const descTextarea = document.getElementById('log-description') as HTMLTextAreaElement;
    const fileInput = document.getElementById('log-photo') as HTMLInputElement;
    const form = document.querySelector('[data-testid="log-entry-form"]') as HTMLFormElement;

    const file = new File([''], 'rose_watering.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 });

    act(() => {
      changeTextareaValue(descTextarea, 'Rose is growing fast.');
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    expect(mockStorageService.uploadPhoto).toHaveBeenCalled();
    expect(mockStorageService.getPublicUrl).toHaveBeenCalledWith('mock-uploaded-path');
    expect(mockOnSubmit).toHaveBeenCalledWith('Rose is growing fast.', 'https://example.com/mock-photo.jpg');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays loading state during upload and disables buttons', async () => {
    let resolveUpload: any;
    const uploadPromise = new Promise((resolve) => {
      resolveUpload = resolve;
    });

    mockStorageService.uploadPhoto.mockReturnValue(uploadPromise);

    renderComponent({ isOpen: true });

    const fileInput = document.getElementById('log-photo') as HTMLInputElement;
    const form = document.querySelector('[data-testid="log-entry-form"]') as HTMLFormElement;
    const cancelBtn = document.querySelector('[data-testid="cancel-log-button"]') as HTMLButtonElement;
    const submitBtn = document.querySelector('[data-testid="submit-log-button"]') as HTMLButtonElement;

    const file = new File([''], 'plant.jpg', { type: 'image/jpeg' });
    act(() => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    act(() => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    // Check loading elements
    const statusText = document.querySelector('[data-testid="uploading-status"]');
    expect(statusText).toBeTruthy();
    expect(statusText?.textContent).toContain('Uploading photo');
    expect(cancelBtn.disabled).toBe(true);
    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.textContent).toBe('Uploading...');

    // Resolve upload
    await act(async () => {
      resolveUpload('done-path');
    });

    // Wait a tick for remaining promise chain to flush
    await act(async () => {});

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('displays upload error if storageService throws during upload', async () => {
    mockStorageService.uploadPhoto.mockRejectedValue(new Error('Network upload failed'));

    renderComponent({ isOpen: true });

    const fileInput = document.getElementById('log-photo') as HTMLInputElement;
    const form = document.querySelector('[data-testid="log-entry-form"]') as HTMLFormElement;

    const file = new File([''], 'plant.jpg', { type: 'image/jpeg' });
    act(() => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    const errorMsg = document.querySelector('[data-testid="error-message"]');
    expect(errorMsg).toBeTruthy();
    expect(errorMsg?.textContent).toContain('Network upload failed');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('enforces design contract preconditions', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      act(() => {
        root.render(
          React.createElement(LogEntryDialog, {
            isOpen: 'not-a-boolean' as any,
            onClose: mockOnClose,
            onSubmit: mockOnSubmit,
          })
        );
      });
    }).toThrow('Precondition failed: isOpen must be a boolean');

    expect(() => {
      act(() => {
        root.render(
          React.createElement(LogEntryDialog, {
            isOpen: true,
            onClose: 'not-a-function' as any,
            onSubmit: mockOnSubmit,
          })
        );
      });
    }).toThrow('Precondition failed: onClose must be a function');

    expect(() => {
      act(() => {
        root.render(
          React.createElement(LogEntryDialog, {
            isOpen: true,
            onClose: mockOnClose,
            onSubmit: 'not-a-function' as any,
          })
        );
      });
    }).toThrow('Precondition failed: onSubmit must be a function');

    consoleSpy.mockRestore();
  });
});
