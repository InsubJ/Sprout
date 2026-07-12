import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  closeOnOverlayClick?: boolean;
}

/**
 * Reusable modal popup shell matching Cozy Forest's premium design aesthetics.
 * Encapsulates focus trapping, escape key detection, click-outside dismissal,
 * and standard ARIA role/modal accessibility requirements.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  closeOnOverlayClick = true,
}): React.ReactElement | null => {
  // Preconditions validation (Design by Contract)
  if (typeof isOpen !== 'boolean') {
    throw new Error('Precondition failed: isOpen must be a boolean');
  }
  if (typeof onClose !== 'function') {
    throw new Error('Precondition failed: onClose must be a function');
  }

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  // Manage client-only mount state to prevent SSR hydration mismatches
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Manage focus trap: restore focus when closed, focus first element when opened
  useEffect(() => {
    if (isOpen && mounted) {
      // Capture the element that currently has focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Put focus inside the modal
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    } else {
      // Restore focus to the element that was focused before opening
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }

    return () => {
      // Cleanup: restore focus if component unmounts while open
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, mounted]);

  // Handle keyboard interaction (Escape to close, Tab to trap focus)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        if (!modalRef.current) return;

        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        );

        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          // If shift + tab and we are on the first focusable item, cycle to last
          if (document.activeElement === first) {
            last.focus();
            event.preventDefault();
          } else if (document.activeElement === modalRef.current) {
            // Also handle if focus is on the container itself
            last.focus();
            event.preventDefault();
          }
        } else {
          // If tab and we are on the last focusable item, cycle to first
          if (document.activeElement === last) {
            first.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (!mounted) return null;

  // Handle background overlay click/tap.
  // Consumers can disable outside-click dismissal with closeOnOverlayClick={false}.
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      closeOnOverlayClick &&
      event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      data-testid="modal-overlay"
    >
      <div
        ref={modalRef}
        className={styles.content}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        data-testid="modal-content"
      >
        <div className={styles.header}>
          {title && (
            <h2 id="modal-title" className={styles.title} data-testid="modal-title">
              {title}
            </h2>
          )}
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
            data-testid="modal-close-button"
          >
            &times;
          </button>
        </div>
        <div className={styles.body} data-testid="modal-body">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};