import React, { useState } from 'react';
import { HabitFrequency, FlexibleRules } from '../../types/habit';
import styles from './HabitForm.module.css';

export interface HabitFormData {
  name: string;
  description: string;
  frequency: HabitFrequency;
  target_waterings: number;
  wither_threshold: number;
  flexible_rules: FlexibleRules | null;
}

export interface HabitFormProps {
  initialData?: Partial<HabitFormData>;
  onSubmit: (data: HabitFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const HabitForm: React.FC<HabitFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  // Encapsulate form state
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [frequency, setFrequency] = useState<HabitFrequency>(initialData?.frequency || 'daily');
  const [targetWaterings, setTargetWaterings] = useState<string>(
    initialData?.target_waterings !== undefined ? String(initialData.target_waterings) : '30'
  );
  const [witherThreshold, setWitherThreshold] = useState<string>(
    initialData?.wither_threshold !== undefined ? String(initialData.wither_threshold) : '3'
  );
  
  // Flexible rules state
  const [flexibleDaysRequired, setFlexibleDaysRequired] = useState<string>(
    initialData?.flexible_rules?.days_required !== undefined ? String(initialData.flexible_rules.days_required) : '3'
  );
  const [flexibleDaysTotal, setFlexibleDaysTotal] = useState<string>(
    initialData?.flexible_rules?.days_total !== undefined ? String(initialData.flexible_rules.days_total) : '7'
  );

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate Inputs (Preconditions check)
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate Name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less';
    }

    // Validate Target Waterings
    const parsedWaterings = Number(targetWaterings);
    if (!targetWaterings) {
      newErrors.target_waterings = 'Target waterings is required';
    } else if (!Number.isInteger(parsedWaterings) || parsedWaterings <= 0) {
      newErrors.target_waterings = 'Target waterings must be a positive integer';
    }

    // Validate Wither Threshold
    const parsedWither = Number(witherThreshold);
    if (!witherThreshold) {
      newErrors.wither_threshold = 'Wither threshold is required';
    } else if (!Number.isInteger(parsedWither) || parsedWither <= 0) {
      newErrors.wither_threshold = 'Wither threshold must be a positive integer';
    }

    // Validate Flexible Rules if frequency is flexible
    if (frequency === 'flexible') {
      const parsedReq = Number(flexibleDaysRequired);
      const parsedTotal = Number(flexibleDaysTotal);

      if (!flexibleDaysRequired) {
        newErrors.flexible_days_required = 'Required days is required';
      } else if (!Number.isInteger(parsedReq) || parsedReq <= 0) {
        newErrors.flexible_days_required = 'Must be a positive integer';
      }

      if (!flexibleDaysTotal) {
        newErrors.flexible_days_total = 'Total days is required';
      } else if (!Number.isInteger(parsedTotal) || parsedTotal <= 0) {
        newErrors.flexible_days_total = 'Must be a positive integer';
      }

      if (
        Number.isInteger(parsedReq) &&
        Number.isInteger(parsedTotal) &&
        parsedReq > 0 &&
        parsedTotal > 0
      ) {
        if (parsedReq > parsedTotal) {
          newErrors.flexible_rules = 'Required days cannot exceed total days';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (validateForm()) {
      const parsedWaterings = parseInt(targetWaterings, 10);
      const parsedWither = parseInt(witherThreshold, 10);
      
      const flexibleRules: FlexibleRules | null =
        frequency === 'flexible'
          ? {
              days_required: parseInt(flexibleDaysRequired, 10),
              days_total: parseInt(flexibleDaysTotal, 10),
            }
          : null;

      const formData: HabitFormData = {
        name: name.trim(),
        description: description.trim(),
        frequency,
        target_waterings: parsedWaterings,
        wither_threshold: parsedWither,
        flexible_rules: flexibleRules,
      };

      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate data-testid="habit-form">
      <div className={styles.fieldGroup}>
        <label htmlFor="habit-name" className={styles.label}>
          Habit Name
        </label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Read daily, Water plants..."
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          disabled={isSubmitting}
        />
        {errors.name && <span className={styles.errorMessage} data-testid="error-name">{errors.name}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="habit-description" className={styles.label}>
          Description
        </label>
        <textarea
          id="habit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this habit about?"
          className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
          disabled={isSubmitting}
          rows={3}
        />
        {errors.description && <span className={styles.errorMessage} data-testid="error-description">{errors.description}</span>}
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label htmlFor="habit-frequency" className={styles.label}>
            Frequency
          </label>
          <select
            id="habit-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
            className={styles.select}
            disabled={isSubmitting}
          >
            <option value="twice_daily">Twice Daily</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>

      {frequency === 'flexible' && (
        <div className={styles.flexibleRulesContainer} data-testid="flexible-rules-section">
          <h4 className={styles.subHeading}>Flexible Schedule Setup</h4>
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label htmlFor="habit-flexible-days-required" className={styles.label}>
                Days Required
              </label>
              <input
                id="habit-flexible-days-required"
                type="number"
                min="1"
                value={flexibleDaysRequired}
                onChange={(e) => setFlexibleDaysRequired(e.target.value)}
                className={`${styles.input} ${errors.flexible_days_required ? styles.inputError : ''}`}
                disabled={isSubmitting}
              />
              {errors.flexible_days_required && (
                <span className={styles.errorMessage} data-testid="error-flexible-days-required">{errors.flexible_days_required}</span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="habit-flexible-days-total" className={styles.label}>
                Out of (Total Days)
              </label>
              <input
                id="habit-flexible-days-total"
                type="number"
                min="1"
                value={flexibleDaysTotal}
                onChange={(e) => setFlexibleDaysTotal(e.target.value)}
                className={`${styles.input} ${errors.flexible_days_total ? styles.inputError : ''}`}
                disabled={isSubmitting}
              />
              {errors.flexible_days_total && (
                <span className={styles.errorMessage} data-testid="error-flexible-days-total">{errors.flexible_days_total}</span>
              )}
            </div>
          </div>
          {errors.flexible_rules && (
            <span className={styles.errorMessageBlock} data-testid="error-flexible-rules">{errors.flexible_rules}</span>
          )}
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label htmlFor="habit-target-waterings" className={styles.label}>
            Target Waterings
          </label>
          <input
            id="habit-target-waterings"
            type="number"
            min="1"
            value={targetWaterings}
            onChange={(e) => setTargetWaterings(e.target.value)}
            className={`${styles.input} ${errors.target_waterings ? styles.inputError : ''}`}
            disabled={isSubmitting}
          />
          {errors.target_waterings && (
            <span className={styles.errorMessage} data-testid="error-target-waterings">{errors.target_waterings}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="habit-wither-threshold" className={styles.label}>
            Wither Threshold (Days)
          </label>
          <input
            id="habit-wither-threshold"
            type="number"
            min="1"
            value={witherThreshold}
            onChange={(e) => setWitherThreshold(e.target.value)}
            className={`${styles.input} ${errors.wither_threshold ? styles.inputError : ''}`}
            disabled={isSubmitting}
          />
          {errors.wither_threshold && (
            <span className={styles.errorMessage} data-testid="error-wither-threshold">{errors.wither_threshold}</span>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Habit'}
        </button>
      </div>
    </form>
  );
};