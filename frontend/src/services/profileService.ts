import { SupabaseClient } from '@supabase/supabase-js';
import { Profile } from '../types/profile';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export class ProfileService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    if (!supabaseClient) {
      throw new Error('Supabase client is required');
    }
    this.supabase = supabaseClient;
  }

  /**
   * Searches for profiles by username, excluding the current user.
   * Preconditions:
   * - currentUserId must be a valid UUID.
   */
  async searchProfiles(query: string, currentUserId: string): Promise<Profile[]> {
    if (!currentUserId) {
      throw new Error('Current User ID is required');
    }
    if (!isValidUuid(currentUserId)) {
      throw new Error('Current User ID must be a valid UUID');
    }
    if (!query || query.trim() === '') {
      return [];
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId)
      .ilike('username', `%${query.trim()}%`);

    if (error) {
      throw new Error(`Failed to search profiles: ${error.message}`);
    }

    return (data || []) as Profile[];
  }

  /**
   * Retrieves user profiles for a list of UUIDs.
   * Preconditions:
   * - ids must be an array of valid UUIDs.
   */
  async getProfilesByIds(ids: string[]): Promise<Profile[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    for (const id of ids) {
      if (!isValidUuid(id)) {
        throw new Error('Profile ID must be a valid UUID');
      }
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .in('id', ids);

    if (error) {
      throw new Error(`Failed to fetch profiles: ${error.message}`);
    }

    return (data || []) as Profile[];
  }
}
