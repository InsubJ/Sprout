import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  InteractionService,
  InteractionValidationError,
  InteractionNotFoundError,
  InteractionDatabaseError
} from '../services/interactionService';
import { LogComment, LogReaction } from '../types/interaction';

class SupabaseQueryMockBuilder {
  public select = vi.fn().mockReturnValue(this);
  public insert = vi.fn().mockReturnValue(this);
  public delete = vi.fn().mockReturnValue(this);
  public eq = vi.fn().mockReturnValue(this);
  public order = vi.fn().mockReturnValue(this);
  public single = vi.fn().mockReturnValue(this);
  public maybeSingle = vi.fn().mockReturnValue(this);

  private resolveValue: any = { data: null, error: null };

  setResult(data: any, error: any = null) {
    this.resolveValue = { data, error };
    return this;
  }

  then(resolve: any) {
    return Promise.resolve(this.resolveValue).then(resolve);
  }
}

describe('InteractionService', () => {
  let mockBuilder: SupabaseQueryMockBuilder;
  let mockSupabase: any;
  let service: InteractionService;

  const validLogId = '11111111-1111-1111-1111-111111111111';
  const validUserId = '22222222-2222-2222-2222-222222222222';
  const validCommentId = '33333333-3333-3333-3333-333333333333';
  const validReactionId = '44444444-4444-4444-4444-444444444444';

  const mockComment: LogComment = {
    id: validCommentId,
    log_id: validLogId,
    user_id: validUserId,
    content: 'Great job!',
    created_at: new Date().toISOString()
  };

  const mockReaction: LogReaction = {
    id: validReactionId,
    log_id: validLogId,
    user_id: validUserId,
    reaction_type: 'like',
    created_at: new Date().toISOString()
  };

  beforeEach(() => {
    mockBuilder = new SupabaseQueryMockBuilder();
    mockSupabase = {
      from: vi.fn().mockReturnValue(mockBuilder)
    };
    service = new InteractionService(mockSupabase);
  });

  describe('Constructor', () => {
    it('should throw error if supabase client is not provided', () => {
      expect(() => new InteractionService(null as any)).toThrow('Supabase client is required');
    });
  });

  describe('addComment', () => {
    const input = {
      log_id: validLogId,
      user_id: validUserId,
      content: 'Great job!'
    };

    it('should add comment successfully with valid inputs', async () => {
      mockBuilder.setResult(mockComment);

      const result = await service.addComment(input);

      expect(mockSupabase.from).toHaveBeenCalledWith('log_comments');
      expect(mockBuilder.insert).toHaveBeenCalledWith([input]);
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.single).toHaveBeenCalled();
      expect(result).toEqual(mockComment);
    });

    it('should throw InteractionValidationError if log_id is not a valid UUID', async () => {
      const invalidInput = { ...input, log_id: 'invalid-uuid' };
      await expect(service.addComment(invalidInput)).rejects.toThrow(InteractionValidationError);
    });

    it('should throw InteractionValidationError if user_id is not a valid UUID', async () => {
      const invalidInput = { ...input, user_id: 'invalid-uuid' };
      await expect(service.addComment(invalidInput)).rejects.toThrow(InteractionValidationError);
    });

    it('should throw InteractionValidationError if content is blank', async () => {
      const invalidInput = { ...input, content: '   ' };
      await expect(service.addComment(invalidInput)).rejects.toThrow(InteractionValidationError);
    });

    it('should throw InteractionDatabaseError if database query fails', async () => {
      mockBuilder.setResult(null, { message: 'Database failure' });
      await expect(service.addComment(input)).rejects.toThrow(InteractionDatabaseError);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment successfully with valid ID', async () => {
      mockBuilder.setResult([mockComment]);

      await service.deleteComment(validCommentId);

      expect(mockSupabase.from).toHaveBeenCalledWith('log_comments');
      expect(mockBuilder.delete).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', validCommentId);
      expect(mockBuilder.select).toHaveBeenCalled();
    });

    it('should throw InteractionValidationError if commentId is not a valid UUID', async () => {
      await expect(service.deleteComment('invalid-uuid')).rejects.toThrow(InteractionValidationError);
    });

    it('should throw InteractionNotFoundError if comment to delete does not exist', async () => {
      mockBuilder.setResult([]);
      await expect(service.deleteComment(validCommentId)).rejects.toThrow(InteractionNotFoundError);
    });

    it('should throw InteractionDatabaseError if database deletion fails', async () => {
      mockBuilder.setResult(null, { message: 'Delete failure' });
      await expect(service.deleteComment(validCommentId)).rejects.toThrow(InteractionDatabaseError);
    });
  });

  describe('toggleReaction', () => {
    const input = {
      log_id: validLogId,
      user_id: validUserId,
      reaction_type: 'like'
    };

    it('should add reaction if it does not already exist', async () => {
      let callCount = 0;
      mockBuilder.then = vi.fn().mockImplementation((resolve: any) => {
        callCount++;
        if (callCount === 1) {
          // first check: reaction not found
          return Promise.resolve({ data: null, error: null }).then(resolve);
        } else {
          // second check: reaction inserted
          return Promise.resolve({ data: mockReaction, error: null }).then(resolve);
        }
      });

      const result = await service.toggleReaction(input);

      expect(mockSupabase.from).toHaveBeenCalledWith('log_reactions');
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('log_id', validLogId);
      expect(mockBuilder.eq).toHaveBeenCalledWith('user_id', validUserId);
      expect(mockBuilder.eq).toHaveBeenCalledWith('reaction_type', 'like');
      expect(mockBuilder.insert).toHaveBeenCalledWith([input]);
      expect(result).toEqual(mockReaction);
    });

    it('should remove reaction if it already exists', async () => {
      let callCount = 0;
      mockBuilder.then = vi.fn().mockImplementation((resolve: any) => {
        callCount++;
        if (callCount === 1) {
          // first check: reaction exists
          return Promise.resolve({ data: mockReaction, error: null }).then(resolve);
        } else {
          // second check: reaction deleted
          return Promise.resolve({ data: [mockReaction], error: null }).then(resolve);
        }
      });

      const result = await service.toggleReaction(input);

      expect(mockSupabase.from).toHaveBeenCalledWith('log_reactions');
      expect(mockBuilder.delete).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', validReactionId);
      expect(result).toBeNull();
    });

    it('should throw InteractionValidationError if reaction_type is empty', async () => {
      const invalidInput = { ...input, reaction_type: '  ' };
      await expect(service.toggleReaction(invalidInput)).rejects.toThrow(InteractionValidationError);
    });

    it('should throw InteractionDatabaseError if existing reaction fetch fails', async () => {
      mockBuilder.setResult(null, { message: 'Fetch failure' });
      await expect(service.toggleReaction(input)).rejects.toThrow(InteractionDatabaseError);
    });

    it('should throw InteractionDatabaseError if insert fails when adding reaction', async () => {
      let callCount = 0;
      mockBuilder.then = vi.fn().mockImplementation((resolve: any) => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: null, error: null }).then(resolve);
        } else {
          return Promise.resolve({ data: null, error: { message: 'Insert failure' } }).then(resolve);
        }
      });
      await expect(service.toggleReaction(input)).rejects.toThrow(InteractionDatabaseError);
    });

    it('should throw InteractionDatabaseError if delete fails when removing reaction', async () => {
      let callCount = 0;
      mockBuilder.then = vi.fn().mockImplementation((resolve: any) => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: mockReaction, error: null }).then(resolve);
        } else {
          return Promise.resolve({ data: null, error: { message: 'Delete failure' } }).then(resolve);
        }
      });
      await expect(service.toggleReaction(input)).rejects.toThrow(InteractionDatabaseError);
    });
  });

  describe('getCommentsByLogId', () => {
    it('should fetch comments for a log successfully', async () => {
      mockBuilder.setResult([mockComment]);

      const result = await service.getCommentsByLogId(validLogId);

      expect(mockSupabase.from).toHaveBeenCalledWith('log_comments');
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('log_id', validLogId);
      expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result).toEqual([mockComment]);
    });

    it('should throw InteractionValidationError if logId is not a valid UUID', async () => {
      await expect(service.getCommentsByLogId('invalid-uuid')).rejects.toThrow(InteractionValidationError);
    });

    it('should throw InteractionDatabaseError if query fails', async () => {
      mockBuilder.setResult(null, { message: 'Fetch failure' });
      await expect(service.getCommentsByLogId(validLogId)).rejects.toThrow(InteractionDatabaseError);
    });
  });

  describe('getReactionsByLogId', () => {
    it('should fetch reactions for a log successfully', async () => {
      mockBuilder.setResult([mockReaction]);

      const result = await service.getReactionsByLogId(validLogId);

      expect(mockSupabase.from).toHaveBeenCalledWith('log_reactions');
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('log_id', validLogId);
      expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result).toEqual([mockReaction]);
    });

    it('should throw InteractionValidationError if logId is not a valid UUID', async () => {
      await expect(service.getReactionsByLogId('invalid-uuid')).rejects.toThrow(InteractionValidationError);
    });

    it('should throw InteractionDatabaseError if query fails', async () => {
      mockBuilder.setResult(null, { message: 'Fetch failure' });
      await expect(service.getReactionsByLogId(validLogId)).rejects.toThrow(InteractionDatabaseError);
    });
  });
});
