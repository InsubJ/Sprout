import { SendNudgeInput } from '../types/nudge';
import { ValidationError, ValidationResult } from './habitValidation';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export function validateSendNudgeInput(input: any): ValidationResult<SendNudgeInput> {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== 'object') {
    return {
      success: false,
      errors: [{ field: 'input', message: 'Input must be a valid object' }]
    };
  }

  // sender_id (Required)
  if (input.sender_id === undefined || input.sender_id === null) {
    errors.push({ field: 'sender_id', message: 'Sender ID is required' });
  } else if (typeof input.sender_id !== 'string') {
    errors.push({ field: 'sender_id', message: 'Sender ID must be a string' });
  } else if (!isValidUuid(input.sender_id)) {
    errors.push({ field: 'sender_id', message: 'Sender ID must be a valid UUID' });
  }

  // receiver_id (Required)
  if (input.receiver_id === undefined || input.receiver_id === null) {
    errors.push({ field: 'receiver_id', message: 'Receiver ID is required' });
  } else if (typeof input.receiver_id !== 'string') {
    errors.push({ field: 'receiver_id', message: 'Receiver ID must be a string' });
  } else if (!isValidUuid(input.receiver_id)) {
    errors.push({ field: 'receiver_id', message: 'Receiver ID must be a valid UUID' });
  }

  // habit_id (Required)
  if (input.habit_id === undefined || input.habit_id === null) {
    errors.push({ field: 'habit_id', message: 'Habit ID is required' });
  } else if (typeof input.habit_id !== 'string') {
    errors.push({ field: 'habit_id', message: 'Habit ID must be a string' });
  } else if (!isValidUuid(input.habit_id)) {
    errors.push({ field: 'habit_id', message: 'Habit ID must be a valid UUID' });
  }

  // Double Check: sender_id and receiver_id cannot be the same
  if (input.sender_id === input.receiver_id && isValidUuid(input.sender_id)) {
    errors.push({ field: 'receiver_id', message: 'Sender and receiver cannot be the same user' });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      sender_id: input.sender_id,
      receiver_id: input.receiver_id,
      habit_id: input.habit_id
    }
  };
}
