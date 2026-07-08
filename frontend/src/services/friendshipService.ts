import { SupabaseClient } from '@supabase/supabase-js';
import { Friendship, SendFriendshipRequestInput } from '../types/friendship';
import { validateSendFriendshipRequestInput } from '../utils/friendshipValidation';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export class FriendshipServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FriendshipServiceError';
  }
}

export class FriendshipValidationError extends FriendshipServiceError {
  public errors: any[];
  constructor(message: string, errors: any[] = []) {
    super(message);
    this.name = 'FriendshipValidationError';
    this.errors = errors;
  }
}

export class FriendshipNotFoundError extends FriendshipServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'FriendshipNotFoundError';
  }
}

export class FriendshipDuplicateRequestError extends FriendshipServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'FriendshipDuplicateRequestError';
  }
}

export class FriendshipDatabaseError extends FriendshipServiceError {
  public originalError: any;
  constructor(message: string, originalError?: any) {
    super(message);
    this.name = 'FriendshipDatabaseError';
    this.originalError = originalError;
  }
}

export class FriendshipService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    if (!supabaseClient) {
      throw new Error('Supabase client is required');
    }
    this.supabase = supabaseClient;
  }

  /**
   * Sends a friendship request.
   * Preconditions:
   * - user_id and friend_id must be valid, distinct UUIDs.
   * - No friendship record must already exist between user_id and friend_id (in any status).
   * @param input Data required to send request.
   */
  async sendFriendRequest(input: SendFriendshipRequestInput): Promise<Friendship> {
    const validation = validateSendFriendshipRequestInput(input);
    if (!validation.success || !validation.data) {
      throw new FriendshipValidationError('Invalid send friendship request input', validation.errors || []);
    }

    const { user_id, friend_id } = validation.data;

    // Check for duplicate request or existing relationship
    const { data: existing, error: findError } = await this.supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${user_id},friend_id.eq.${user_id}`);

    if (findError) {
      throw new FriendshipDatabaseError(`Failed to check existing friendship: ${findError.message}`, findError);
    }

    const duplicate = existing?.find(
      (r: any) =>
        (r.user_id === user_id && r.friend_id === friend_id) ||
        (r.user_id === friend_id && r.friend_id === user_id)
    );

    if (duplicate) {
      throw new FriendshipDuplicateRequestError('Friendship request or relationship already exists between these users');
    }

    // Insert new pending request
    const { data, error } = await this.supabase
      .from('friendships')
      .insert([{ user_id, friend_id, status: 'pending' }])
      .select()
      .single();

    if (error) {
      throw new FriendshipDatabaseError(`Failed to send friend request: ${error.message}`, error);
    }

    if (!data) {
      throw new FriendshipDatabaseError('Failed to retrieve created friendship data');
    }

    return data as Friendship;
  }

  /**
   * Accepts a pending friendship request.
   * Preconditions:
   * - friendshipId and currentUserId must be valid UUIDs.
   * - Friendship must exist and have status 'pending'.
   * - currentUserId must be the recipient of the request (friend_id).
   */
  async acceptFriendRequest(friendshipId: string, currentUserId: string): Promise<Friendship> {
    if (!isValidUuid(friendshipId)) {
      throw new FriendshipValidationError('Friendship ID must be a valid UUID');
    }
    if (!isValidUuid(currentUserId)) {
      throw new FriendshipValidationError('Current User ID must be a valid UUID');
    }

    // Fetch the friendship record first
    const { data: friendship, error: fetchError } = await this.supabase
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new FriendshipNotFoundError(`Friendship request with ID ${friendshipId} not found`);
      }
      throw new FriendshipDatabaseError(`Failed to fetch friendship: ${fetchError.message}`, fetchError);
    }

    if (!friendship) {
      throw new FriendshipNotFoundError(`Friendship request with ID ${friendshipId} not found`);
    }

    // Check preconditions
    if (friendship.status !== 'pending') {
      throw new FriendshipValidationError(`Cannot accept request in '${friendship.status}' status`);
    }

    if (friendship.friend_id !== currentUserId) {
      throw new FriendshipValidationError('Only the recipient of the request can accept it');
    }

    // Perform update
    const { data, error } = await this.supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
      .select()
      .single();

    if (error) {
      throw new FriendshipDatabaseError(`Failed to accept friend request: ${error.message}`, error);
    }

    return data as Friendship;
  }

  /**
   * Declines a pending friendship request.
   * Preconditions:
   * - friendshipId and currentUserId must be valid UUIDs.
   * - Friendship must exist and have status 'pending'.
   * - currentUserId must be the recipient of the request (friend_id).
   */
  async declineFriendRequest(friendshipId: string, currentUserId: string): Promise<Friendship> {
    if (!isValidUuid(friendshipId)) {
      throw new FriendshipValidationError('Friendship ID must be a valid UUID');
    }
    if (!isValidUuid(currentUserId)) {
      throw new FriendshipValidationError('Current User ID must be a valid UUID');
    }

    // Fetch the friendship record first
    const { data: friendship, error: fetchError } = await this.supabase
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new FriendshipNotFoundError(`Friendship request with ID ${friendshipId} not found`);
      }
      throw new FriendshipDatabaseError(`Failed to fetch friendship: ${fetchError.message}`, fetchError);
    }

    if (!friendship) {
      throw new FriendshipNotFoundError(`Friendship request with ID ${friendshipId} not found`);
    }

    // Check preconditions
    if (friendship.status !== 'pending') {
      throw new FriendshipValidationError(`Cannot decline request in '${friendship.status}' status`);
    }

    if (friendship.friend_id !== currentUserId) {
      throw new FriendshipValidationError('Only the recipient of the request can decline it');
    }

    // Perform update
    const { data, error } = await this.supabase
      .from('friendships')
      .update({ status: 'declined' })
      .eq('id', friendshipId)
      .select()
      .single();

    if (error) {
      throw new FriendshipDatabaseError(`Failed to decline friend request: ${error.message}`, error);
    }

    return data as Friendship;
  }

  /**
   * Retrieves all friendships for a user (pending, accepted, or declined).
   */
  async getFriendships(userId: string): Promise<Friendship[]> {
    if (!isValidUuid(userId)) {
      throw new FriendshipValidationError('User ID must be a valid UUID');
    }

    const { data, error } = await this.supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (error) {
      throw new FriendshipDatabaseError(`Failed to fetch friendships: ${error.message}`, error);
    }

    return (data || []) as Friendship[];
  }

  /**
   * Retrieves pending requests received by a user.
   */
  async getPendingRequests(userId: string): Promise<Friendship[]> {
    if (!isValidUuid(userId)) {
      throw new FriendshipValidationError('User ID must be a valid UUID');
    }

    const { data, error } = await this.supabase
      .from('friendships')
      .select('*')
      .eq('friend_id', userId)
      .eq('status', 'pending');

    if (error) {
      throw new FriendshipDatabaseError(`Failed to fetch pending requests: ${error.message}`, error);
    }

    return (data || []) as Friendship[];
  }

  /**
   * Retrieves accepted friendships for a user.
   */
  async getAcceptedFriends(userId: string): Promise<Friendship[]> {
    if (!isValidUuid(userId)) {
      throw new FriendshipValidationError('User ID must be a valid UUID');
    }

    const { data, error } = await this.supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) {
      throw new FriendshipDatabaseError(`Failed to fetch accepted friends: ${error.message}`, error);
    }

    return (data || []) as Friendship[];
  }
}
