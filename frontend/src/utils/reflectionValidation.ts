import { ReflectionInput } from '../types/reflection';
import { ValidationError, ValidationResult } from './habitValidation';

export function validateReflectionInput(input: any): ValidationResult<ReflectionInput> {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== 'object') {
    return {
      success: false,
      errors: [{ field: 'input', message: 'Input must be a valid object' }]
    };
  }

  if (input.durationDays === undefined || input.durationDays === null) {
    errors.push({ field: 'durationDays', message: 'Duration in days is required' });
  } else if (typeof input.durationDays !== 'number' || !Number.isInteger(input.durationDays)) {
    errors.push({ field: 'durationDays', message: 'Duration in days must be an integer' });
  } else if (input.durationDays <= 0) {
    errors.push({ field: 'durationDays', message: 'Duration in days must be positive' });
  }

  if (input.witheredCount === undefined || input.witheredCount === null) {
    errors.push({ field: 'witheredCount', message: 'Withered count is required' });
  } else if (typeof input.witheredCount !== 'number' || !Number.isInteger(input.witheredCount)) {
    errors.push({ field: 'witheredCount', message: 'Withered count must be an integer' });
  } else if (input.witheredCount < 0) {
    errors.push({ field: 'witheredCount', message: 'Withered count cannot be negative' });
  }

  if (input.consistencyLogs === undefined || input.consistencyLogs === null) {
    errors.push({ field: 'consistencyLogs', message: 'Consistency logs are required' });
  } else if (!Array.isArray(input.consistencyLogs)) {
    errors.push({ field: 'consistencyLogs', message: 'Consistency logs must be an array' });
  }

  if (input.rescueTimeAvgHours !== undefined && input.rescueTimeAvgHours !== null) {
    if (typeof input.rescueTimeAvgHours !== 'number') {
      errors.push({ field: 'rescueTimeAvgHours', message: 'Average rescue time must be a number' });
    } else if (input.rescueTimeAvgHours < 0) {
      errors.push({ field: 'rescueTimeAvgHours', message: 'Average rescue time cannot be negative' });
    }
  }

  if (input.resilienceScore !== undefined && input.resilienceScore !== null) {
    if (typeof input.resilienceScore !== 'number') {
      errors.push({ field: 'resilienceScore', message: 'Resilience score must be a number' });
    } else if (input.resilienceScore < 0) {
      errors.push({ field: 'resilienceScore', message: 'Resilience score cannot be negative' });
    }
  }

  if (input.plantType !== undefined && input.plantType !== null) {
    if (typeof input.plantType !== 'string') {
      errors.push({ field: 'plantType', message: 'Plant type must be a string' });
    } else if (input.plantType.trim().length === 0) {
      errors.push({ field: 'plantType', message: 'Plant type cannot be empty' });
    } else if (input.plantType.length > 50) {
      errors.push({ field: 'plantType', message: 'Plant type must be 50 characters or less' });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: input as ReflectionInput
  };
}
