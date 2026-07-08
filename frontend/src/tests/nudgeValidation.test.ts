import { describe, it, expect } from 'vitest';
import { validateSendNudgeInput } from '../utils/nudgeValidation';

describe('nudgeValidation', () => {
  const validSenderId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const validReceiverId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const validHabitId = '11111111-1111-1111-1111-111111111111';

  it('should validate successfully with valid inputs', () => {
    const input = {
      sender_id: validSenderId,
      receiver_id: validReceiverId,
      habit_id: validHabitId
    };

    const result = validateSendNudgeInput(input);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(input);
  });

  it('should fail validation if input is not an object', () => {
    const result = validateSendNudgeInput(null);
    expect(result.success).toBe(false);
    expect(result.errors?.[0].message).toBe('Input must be a valid object');
  });

  it('should fail validation if sender_id is missing or invalid', () => {
    const result1 = validateSendNudgeInput({ receiver_id: validReceiverId, habit_id: validHabitId });
    expect(result1.success).toBe(false);
    expect(result1.errors?.[0].field).toBe('sender_id');

    const result2 = validateSendNudgeInput({ sender_id: 'invalid-uuid', receiver_id: validReceiverId, habit_id: validHabitId });
    expect(result2.success).toBe(false);
    expect(result2.errors?.[0].message).toContain('must be a valid UUID');
  });

  it('should fail validation if receiver_id is missing or invalid', () => {
    const result1 = validateSendNudgeInput({ sender_id: validSenderId, habit_id: validHabitId });
    expect(result1.success).toBe(false);
    expect(result1.errors?.[0].field).toBe('receiver_id');

    const result2 = validateSendNudgeInput({ sender_id: validSenderId, receiver_id: 'invalid-uuid', habit_id: validHabitId });
    expect(result2.success).toBe(false);
    expect(result2.errors?.[0].message).toContain('must be a valid UUID');
  });

  it('should fail validation if habit_id is missing or invalid', () => {
    const result1 = validateSendNudgeInput({ sender_id: validSenderId, receiver_id: validReceiverId });
    expect(result1.success).toBe(false);
    expect(result1.errors?.[0].field).toBe('habit_id');

    const result2 = validateSendNudgeInput({ sender_id: validSenderId, receiver_id: validReceiverId, habit_id: 'invalid-uuid' });
    expect(result2.success).toBe(false);
    expect(result2.errors?.[0].message).toContain('must be a valid UUID');
  });

  it('should fail validation if sender_id and receiver_id are identical', () => {
    const result = validateSendNudgeInput({
      sender_id: validSenderId,
      receiver_id: validSenderId,
      habit_id: validHabitId
    });
    expect(result.success).toBe(false);
    expect(result.errors?.[0].field).toBe('receiver_id');
    expect(result.errors?.[0].message).toBe('Sender and receiver cannot be the same user');
  });
});
