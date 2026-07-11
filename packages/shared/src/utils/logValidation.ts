import { CreateHabitLogInput } from '../types/habitLog';
import { ValidationError, ValidationResult } from './habitValidation';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function validateCreateHabitLogInput(input: any): ValidationResult<CreateHabitLogInput> {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== 'object') {
    return {
      success: false,
      errors: [{ field: 'input', message: 'Input must be a valid object' }]
    };
  }

  // habit_id (Required)
  if (input.habit_id === undefined || input.habit_id === null) {
    errors.push({ field: 'habit_id', message: 'Habit ID is required' });
  } else if (typeof input.habit_id !== 'string') {
    errors.push({ field: 'habit_id', message: 'Habit ID must be a string' });
  } else if (!uuidRegex.test(input.habit_id)) {
    errors.push({ field: 'habit_id', message: 'Habit ID must be a valid UUID' });
  }

  // user_id (Required)
  if (input.user_id === undefined || input.user_id === null) {
    errors.push({ field: 'user_id', message: 'User ID is required' });
  } else if (typeof input.user_id !== 'string') {
    errors.push({ field: 'user_id', message: 'User ID must be a string' });
  } else if (!uuidRegex.test(input.user_id)) {
    errors.push({ field: 'user_id', message: 'User ID must be a valid UUID' });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: input as CreateHabitLogInput
  };
}
