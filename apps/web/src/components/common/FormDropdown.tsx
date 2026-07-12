import React, { useEffect, useRef, useState } from 'react';
import styles from './FormDropdown.module.css';

export interface FormDropdownOption<T extends string> {
  value: T;
  label: string;
}

export interface FormDropdownProps<T extends string> {
  id: string;
  value: T;
  options: Array<FormDropdownOption<T>>;
  onChange: (value: T) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function FormDropdown<T extends string>({
  id,
  value,
  options,
  onChange,
  disabled = false,
  ariaLabel,
}: FormDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? '';

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={styles.selectWrapper}>
      <button
        id={id}
        type="button"
        className={`${styles.selectTrigger} ${
          isOpen ? styles.selectTriggerOpen : ''
        }`}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
        disabled={disabled}
      >
        <span>{selectedLabel}</span>
        <span
          className={`${styles.selectChevron} ${
            isOpen ? styles.selectChevronOpen : ''
          }`}
          aria-hidden="true"
        >
          ⌄
        </span>
      </button>

      {isOpen && (
        <div
          id={`${id}-options`}
          className={styles.selectMenu}
          role="listbox"
          aria-labelledby={id}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`${styles.selectOption} ${
                  isSelected ? styles.selectOptionSelected : ''
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <span className={styles.selectCheck} aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
