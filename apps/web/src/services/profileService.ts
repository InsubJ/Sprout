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

  /**
   * Retrieves a single user profile by their username.
   * Preconditions:
   * - username must be a non-empty string.
   */
  async getProfileByUsername(username: string): Promise<Profile | null> {
    if (!username || username.trim() === '') {
      throw new Error('Username is required');
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('username', username.trim())
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch profile by username: ${error.message}`);
    }

    return data as Profile | null;
  }

  /**
   * Updates an existing user profile's details.
   * Preconditions:
   * - profile must contain a valid id, non-empty username.
   */
  async updateProfile(profile: Profile): Promise<Profile> {
    if (!profile.id || !isValidUuid(profile.id)) {
      throw new Error('Precondition failed: Profile ID must be a valid UUID');
    }
    if (!profile.username || profile.username.trim() === '') {
      throw new Error('Precondition failed: Username is required');
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        username: profile.username.trim(),
        display_name: profile.display_name?.trim() || null,
        avatar_url: profile.avatar_url?.trim() || null,
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data as Profile;
  }
}
