import { describe, it, expect } from 'vitest';
import { validateCreateHabitInput, validateUpdateHabitInput } from '../utils/habitValidation';

describe('Habit Input Validation', () => {
  const validUserId = '123e4567-e89b-12d3-a456-426614174000';

  describe('validateCreateHabitInput', () => {
    it('should validate a minimal valid creation input', () => {
      const input = {
        user_id: validUserId,
        name: 'Drink Water',
      };
      const result = validateCreateHabitInput(input);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(input);
      expect(result.errors).toBeUndefined();
    });

    it('should validate a full valid creation input', () => {
      const input = {
        user_id: validUserId,
        name: 'Exercise daily',
        description: '30 mins of cardio',
        plant_type: 'cactus',
        difficulty_tier: 'common',
        frequency: 'daily',
        target_waterings: 50,
        current_waterings: 0,
        wither_threshold: 4,
        consecutive_misses: 0,
        wither_count: 0,
        status: 'healthy',
        is_public: true,
        current_streak: 0,
        max_streak: 0,
      };
      const result = validateCreateHabitInput(input);
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate flexible frequency habits with valid flexible_rules', () => {
      const input = {
        user_id: validUserId,
        name: 'Gym',
        frequency: 'flexible',
        flexible_rules: {
          days_required: 4,
          days_total: 7
        }
      };
      const result = validateCreateHabitInput(input);
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should fail if user_id is missing or invalid', () => {
      const missingUserIdResult = validateCreateHabitInput({ name: 'Habit' });
      expect(missingUserIdResult.success).toBe(false);
      expect(missingUserIdResult.errors?.some(e => e.field === 'user_id')).toBe(true);

      const invalidUserIdResult = validateCreateHabitInput({ user_id: 'invalid-uuid', name: 'Habit' });
      expect(invalidUserIdResult.success).toBe(false);
      expect(invalidUserIdResult.errors?.some(e => e.field === 'user_id')).toBe(true);
    });

    it('should fail if name is missing or empty or too long', () => {
      const missingNameResult = validateCreateHabitInput({ user_id: validUserId });
      expect(missingNameResult.success).toBe(false);
      expect(missingNameResult.errors?.some(e => e.field === 'name')).toBe(true);

      const emptyNameResult = validateCreateHabitInput({ user_id: validUserId, name: '   ' });
      expect(emptyNameResult.success).toBe(false);
      expect(emptyNameResult.errors?.some(e => e.field === 'name')).toBe(true);

      const longNameResult = validateCreateHabitInput({ user_id: validUserId, name: 'a'.repeat(101) });
      expect(longNameResult.success).toBe(false);
      expect(longNameResult.errors?.some(e => e.field === 'name')).toBe(true);
    });

    it('should fail on invalid enum values', () => {
      const invalidFreqResult = validateCreateHabitInput({
        user_id: validUserId,
        name: 'Habit',
        frequency: 'hourly'
      });
      expect(invalidFreqResult.success).toBe(false);
      expect(invalidFreqResult.errors?.some(e => e.field === 'frequency')).toBe(true);

      const invalidDifficultyResult = validateCreateHabitInput({
        user_id: validUserId,
        name: 'Habit',
        difficulty_tier: 'impossible'
      });
      expect(invalidDifficultyResult.success).toBe(false);
      expect(invalidDifficultyResult.errors?.some(e => e.field === 'difficulty_tier')).toBe(true);
    });

    it('should fail on invalid numbers or ranges', () => {
      const nonPositiveTargetResult = validateCreateHabitInput({
        user_id: validUserId,
        name: 'Habit',
        target_waterings: 0
      });
      expect(nonPositiveTargetResult.success).toBe(false);
      expect(nonPositiveTargetResult.errors?.some(e => e.field === 'target_waterings')).toBe(true);

      const negativeCurrentResult = validateCreateHabitInput({
        user_id: validUserId,
        name: 'Habit',
        current_waterings: -1
      });
      expect(negativeCurrentResult.success).toBe(false);
      expect(negativeCurrentResult.errors?.some(e => e.field === 'current_waterings')).toBe(true);
    });

    it('should fail if current_waterings exceeds target_waterings', () => {
      const result = validateCreateHabitInput({
        user_id: validUserId,
        name: 'Habit',
        target_waterings: 10,
        current_waterings: 11
      });
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'current_waterings')).toBe(true);
    });

    it('should fail if current_streak exceeds max_streak', () => {
      const result = validateCreateHabitInput({
        user_id: validUserId,
        name: 'Habit',
        current_streak: 5,
        max_streak: 4
      });
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'current_streak')).toBe(true);
    });

    it('should fail flexible frequency habits without flexible_rules', () => {
      const result = validateCreateHabitInput({
        user_id: validUserId,
        name: 'Gym',
        frequency: 'flexible'
      });
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'flexible_rules')).toBe(true);
    });

    it('should fail flexible frequency habits with invalid flexible_rules', () => {
      const result1 = validateCreateHabitInput({
        user_id: validUserId,
        name: 'Gym',
        frequency: 'flexible',
        flexible_rules: {
          days_required: 8,
          days_total: 7
        }
      });
      expect(result1.success).toBe(false);
      expect(result1.errors?.some(e => e.field === 'flexible_rules')).toBe(true);

      const result2 = validateCreateHabitInput({
        user_id: validUserId,
        name: 'Gym',
        frequency: 'flexible',
        flexible_rules: {
          days_required: -1,
          days_total: 7
        }
      });
      expect(result2.success).toBe(false);
      expect(result2.errors?.some(e => e.field === 'flexible_rules.days_required')).toBe(true);
    });
  });

  describe('validateUpdateHabitInput', () => {
    it('should validate an empty update object', () => {
      const input = {};
      const result = validateUpdateHabitInput(input);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(input);
    });

    it('should validate a partial valid update object', () => {
      const input = {
        name: 'Clean Room',
        current_waterings: 5,
        completed_at: new Date().toISOString()
      };
      const result = validateUpdateHabitInput(input);
      expect(result.success).toBe(true);
    });

    it('should fail if updated name is empty', () => {
      const result = validateUpdateHabitInput({ name: '   ' });
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'name')).toBe(true);
    });

    it('should fail if updated completed_at is not a valid date string', () => {
      const result = validateUpdateHabitInput({ completed_at: 'not-a-date' });
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'completed_at')).toBe(true);
    });

    it('should fail if flexible rules are set to null when frequency is flexible', () => {
      const result = validateUpdateHabitInput({
        frequency: 'flexible',
        flexible_rules: null
      });
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'flexible_rules')).toBe(true);
    });
  });
});
