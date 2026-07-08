import { SendFriendshipRequestInput } from '../types/friendship';
import { ValidationError, ValidationResult } from './habitValidation';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function validateSendFriendshipRequestInput(input: any): ValidationResult<SendFriendshipRequestInput> {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== 'object') {
    return {
      success: false,
      errors: [{ field: 'input', message: 'Input must be a valid object' }]
    };
  }

  // user_id (Required)
  if (input.user_id === undefined || input.user_id === null) {
    errors.push({ field: 'user_id', message: 'User ID is required' });
  } else if (typeof input.user_id !== 'string') {
    errors.push({ field: 'user_id', message: 'User ID must be a string' });
  } else if (!uuidRegex.test(input.user_id)) {
    errors.push({ field: 'user_id', message: 'User ID must be a valid UUID' });
  }

  // friend_id (Required)
  if (input.friend_id === undefined || input.friend_id === null) {
    errors.push({ field: 'friend_id', message: 'Friend ID is required' });
  } else if (typeof input.friend_id !== 'string') {
    errors.push({ field: 'friend_id', message: 'Friend ID must be a string' });
  } else if (!uuidRegex.test(input.friend_id)) {
    errors.push({ field: 'friend_id', message: 'Friend ID must be a valid UUID' });
  }

  // user_id and friend_id cannot be the same
  if (
    typeof input.user_id === 'string' &&
    typeof input.friend_id === 'string' &&
    uuidRegex.test(input.user_id) &&
    uuidRegex.test(input.friend_id) &&
    input.user_id === input.friend_id
  ) {
    errors.push({ field: 'friend_id', message: 'You cannot send a friendship request to yourself' });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: input as SendFriendshipRequestInput
  };
}
