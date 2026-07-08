import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  FriendshipService,
  FriendshipValidationError,
  FriendshipNotFoundError,
  FriendshipDuplicateRequestError,
  FriendshipDatabaseError
} from '../services/friendshipService';
import { Friendship, SendFriendshipRequestInput } from '../types/friendship';

class SupabaseQueryMockBuilder {
  public select = vi.fn().mockReturnValue(this);
  public insert = vi.fn().mockReturnValue(this);
  public update = vi.fn().mockReturnValue(this);
  public delete = vi.fn().mockReturnValue(this);
  public eq = vi.fn().mockReturnValue(this);
  public or = vi.fn().mockReturnValue(this);
  public order = vi.fn().mockReturnValue(this);
  public single = vi.fn().mockReturnValue(this);

  private resolveValue: any = { data: null, error: null };

  setResult(data: any, error: any = null) {
    this.resolveValue = { data, error };
    return this;
  }

  then(resolve: any) {
    return Promise.resolve(this.resolveValue).then(resolve);
  }
}

describe('FriendshipService', () => {
  let mockBuilder: SupabaseQueryMockBuilder;
  let mockSupabase: any;
  let service: FriendshipService;

  const validUserA = '11111111-1111-1111-1111-111111111111';
  const validUserB = '22222222-2222-2222-2222-222222222222';
  const validFriendshipId = '99999999-9999-9999-9999-999999999999';

  const mockFriendship: Friendship = {
    id: validFriendshipId,
    user_id: validUserA,
    friend_id: validUserB,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  beforeEach(() => {
    mockBuilder = new SupabaseQueryMockBuilder();
    mockSupabase = {
      from: vi.fn().mockReturnValue(mockBuilder)
    };
    service = new FriendshipService(mockSupabase);
  });

  describe('Constructor', () => {
    it('should throw error if supabase client is not provided', () => {
      expect(() => new FriendshipService(null as any)).toThrow('Supabase client is required');
    });
  });

  describe('sendFriendRequest', () => {
    const input: SendFriendshipRequestInput = {
      user_id: validUserA,
      friend_id: validUserB
    };

    it('should send a friendship request successfully when no duplicate exists', async () => {
      let callCount = 0;
      mockBuilder.then = vi.fn().mockImplementation((resolve: any) => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: [], error: null }).then(resolve);
        } else {
          return Promise.resolve({ data: mockFriendship, error: null }).then(resolve);
        }
      });

      const result = await service.sendFriendRequest(input);

      expect(mockSupabase.from).toHaveBeenCalledWith('friendships');
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.or).toHaveBeenCalledWith(`user_id.eq.${validUserA},friend_id.eq.${validUserA}`);
      expect(mockBuilder.insert).toHaveBeenCalledWith([{ user_id: validUserA, friend_id: validUserB, status: 'pending' }]);
      expect(result).toEqual(mockFriendship);
    });

    it('should throw FriendshipValidationError if user_id is invalid UUID', async () => {
      const invalidInput = { user_id: 'invalid', friend_id: validUserB };
      await expect(service.sendFriendRequest(invalidInput)).rejects.toThrow(FriendshipValidationError);
    });

    it('should throw FriendshipValidationError if friend_id is invalid UUID', async () => {
      const invalidInput = { user_id: validUserA, friend_id: 'invalid' };
      await expect(service.sendFriendRequest(invalidInput)).rejects.toThrow(FriendshipValidationError);
    });

    it('should throw FriendshipValidationError if user tries to add themselves', async () => {
      const selfInput = { user_id: validUserA, friend_id: validUserA };
      await expect(service.sendFriendRequest(selfInput)).rejects.toThrow(FriendshipValidationError);
    });

    it('should throw FriendshipDuplicateRequestError if request already exists (A -> B)', async () => {
      mockBuilder.setResult([{ ...mockFriendship, status: 'pending' }]);

      await expect(service.sendFriendRequest(input)).rejects.toThrow(FriendshipDuplicateRequestError);
    });

    it('should throw FriendshipDuplicateRequestError if request already exists in reverse direction (B -> A)', async () => {
      mockBuilder.setResult([{ ...mockFriendship, user_id: validUserB, friend_id: validUserA, status: 'pending' }]);

      await expect(service.sendFriendRequest(input)).rejects.toThrow(FriendshipDuplicateRequestError);
    });

    it('should throw FriendshipDuplicateRequestError if relationship is already accepted', async () => {
      mockBuilder.setResult([{ ...mockFriendship, status: 'accepted' }]);

      await expect(service.sendFriendRequest(input)).rejects.toThrow(FriendshipDuplicateRequestError);
    });

    it('should throw FriendshipDuplicateRequestError if relationship was already declined', async () => {
      mockBuilder.setResult([{ ...mockFriendship, status: 'declined' }]);

      await expect(service.sendFriendRequest(input)).rejects.toThrow(FriendshipDuplicateRequestError);
    });

    it('should throw FriendshipDatabaseError if select query fails', async () => {
      mockBuilder.setResult(null, { message: 'Database lookup error' });

      await expect(service.sendFriendRequest(input)).rejects.toThrow(FriendshipDatabaseError);
    });

    it('should throw FriendshipDatabaseError if insert fails', async () => {
      let callCount = 0;
      mockBuilder.then = vi.fn().mockImplementation((resolve: any) => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: [], error: null }).then(resolve);
        } else {
          return Promise.resolve({ data: null, error: { message: 'Insert failed' } }).then(resolve);
        }
      });

      await expect(service.sendFriendRequest(input)).rejects.toThrow(FriendshipDatabaseError);
    });
  });

  describe('acceptFriendRequest', () => {
    it('should accept a pending friend request successfully', async () => {
      let callCount = 0;
      mockBuilder.then = vi.fn().mockImplementation((resolve: any) => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: mockFriendship, error: null }).then(resolve);
        } else {
          return Promise.resolve({ data: { ...mockFriendship, status: 'accepted' }, error: null }).then(resolve);
        }
      });

      const result = await service.acceptFriendRequest(validFriendshipId, validUserB);

      expect(mockSupabase.from).toHaveBeenCalledWith('friendships');
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', validFriendshipId);
      expect(mockBuilder.update).toHaveBeenCalledWith({ status: 'accepted' });
      expect(result.status).toBe('accepted');
    });

    it('should throw FriendshipValidationError if friendshipId is not valid UUID', async () => {
      await expect(service.acceptFriendRequest('invalid', validUserB)).rejects.toThrow(FriendshipValidationError);
    });

    it('should throw FriendshipValidationError if currentUserId is not valid UUID', async () => {
      await expect(service.acceptFriendRequest(validFriendshipId, 'invalid')).rejects.toThrow(FriendshipValidationError);
    });

    it('should throw FriendshipNotFoundError if friendship does not exist (PGRST116)', async () => {
      mockBuilder.setResult(null, { code: 'PGRST116', message: 'No rows' });

      await expect(service.acceptFriendRequest(validFriendshipId, validUserB)).rejects.toThrow(FriendshipNotFoundError);
    });

    it('should throw FriendshipValidationError if request status is already accepted', async () => {
      mockBuilder.setResult({ ...mockFriendship, status: 'accepted' });

      await expect(service.acceptFriendRequest(validFriendshipId, validUserB)).rejects.toThrow(FriendshipValidationError);
    });

    it('should throw FriendshipValidationError if user trying to accept is not the receiver', async () => {
      mockBuilder.setResult(mockFriendship);

      await expect(service.acceptFriendRequest(validFriendshipId, validUserA)).rejects.toThrow(FriendshipValidationError);
    });

    it('should throw FriendshipDatabaseError if accept update fails', async () => {
      let callCount = 0;
      mockBuilder.then = vi.fn().mockImplementation((resolve: any) => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: mockFriendship, error: null }).then(resolve);
        } else {
          return Promise.resolve({ data: null, error: { message: 'Update failed' } }).then(resolve);
        }
      });

      await expect(service.acceptFriendRequest(validFriendshipId, validUserB)).rejects.toThrow(FriendshipDatabaseError);
    });
  });

  describe('declineFriendRequest', () => {
    it('should decline a pending friend request successfully', async () => {
      let callCount = 0;
      mockBuilder.then = vi.fn().mockImplementation((resolve: any) => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: mockFriendship, error: null }).then(resolve);
        } else {
          return Promise.resolve({ data: { ...mockFriendship, status: 'declined' }, error: null }).then(resolve);
        }
      });

      const result = await service.declineFriendRequest(validFriendshipId, validUserB);

      expect(mockSupabase.from).toHaveBeenCalledWith('friendships');
      expect(mockBuilder.update).toHaveBeenCalledWith({ status: 'declined' });
      expect(result.status).toBe('declined');
    });

    it('should throw FriendshipValidationError if status is not pending', async () => {
      mockBuilder.setResult({ ...mockFriendship, status: 'declined' });

      await expect(service.declineFriendRequest(validFriendshipId, validUserB)).rejects.toThrow(FriendshipValidationError);
    });

    it('should throw FriendshipValidationError if user declining is not the receiver', async () => {
      mockBuilder.setResult(mockFriendship);

      await expect(service.declineFriendRequest(validFriendshipId, validUserA)).rejects.toThrow(FriendshipValidationError);
    });
  });

  describe('getFriendships', () => {
    it('should retrieve friendships for a user successfully', async () => {
      const list = [mockFriendship];
      mockBuilder.setResult(list);

      const result = await service.getFriendships(validUserA);

      expect(mockSupabase.from).toHaveBeenCalledWith('friendships');
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.or).toHaveBeenCalledWith(`user_id.eq.${validUserA},friend_id.eq.${validUserA}`);
      expect(result).toEqual(list);
    });

    it('should throw FriendshipValidationError if userId is not a valid UUID', async () => {
      await expect(service.getFriendships('invalid')).rejects.toThrow(FriendshipValidationError);
    });

    it('should throw FriendshipDatabaseError if select fails', async () => {
      mockBuilder.setResult(null, { message: 'Database fetch error' });

      await expect(service.getFriendships(validUserA)).rejects.toThrow(FriendshipDatabaseError);
    });
  });

  describe('getPendingRequests', () => {
    it('should retrieve pending requests received by the user', async () => {
      const list = [mockFriendship];
      mockBuilder.setResult(list);

      const result = await service.getPendingRequests(validUserB);

      expect(mockSupabase.from).toHaveBeenCalledWith('friendships');
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('friend_id', validUserB);
      expect(mockBuilder.eq).toHaveBeenCalledWith('status', 'pending');
      expect(result).toEqual(list);
    });
  });

  describe('getAcceptedFriends', () => {
    it('should retrieve accepted friends for a user successfully', async () => {
      const list = [{ ...mockFriendship, status: 'accepted' as const }];
      mockBuilder.setResult(list);

      const result = await service.getAcceptedFriends(validUserA);

      expect(mockSupabase.from).toHaveBeenCalledWith('friendships');
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.or).toHaveBeenCalledWith(`user_id.eq.${validUserA},friend_id.eq.${validUserA}`);
      expect(mockBuilder.eq).toHaveBeenCalledWith('status', 'accepted');
      expect(result).toEqual(list);
    });
  });
});
