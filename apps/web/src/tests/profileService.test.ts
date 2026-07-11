import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProfileService } from '../services/profileService';
import { Profile } from '../types/profile';

class SupabaseQueryMockBuilder {
  public select = vi.fn().mockReturnValue(this);
  public neq = vi.fn().mockReturnValue(this);
  public ilike = vi.fn().mockReturnValue(this);
  public in = vi.fn().mockReturnValue(this);
  public eq = vi.fn().mockReturnValue(this);
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

describe('ProfileService', () => {
  let mockBuilder: SupabaseQueryMockBuilder;
  let mockSupabase: any;
  let service: ProfileService;

  const validUserId = '11111111-1111-1111-1111-111111111111';
  const otherUserId = '22222222-2222-2222-2222-222222222222';

  const mockProfile: Profile = {
    id: otherUserId,
    username: 'alice',
    display_name: 'Alice Smith',
    avatar_url: null,
    created_at: new Date().toISOString()
  };

  beforeEach(() => {
    mockBuilder = new SupabaseQueryMockBuilder();
    mockSupabase = {
      from: vi.fn().mockReturnValue(mockBuilder)
    };
    service = new ProfileService(mockSupabase);
  });

  describe('Constructor', () => {
    it('should throw error if supabase client is not provided', () => {
      expect(() => new ProfileService(null as any)).toThrow('Supabase client is required');
    });
  });

  describe('searchProfiles', () => {
    it('should query database successfully with valid query and userId', async () => {
      mockBuilder.setResult([mockProfile]);

      const result = await service.searchProfiles('alice', validUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.neq).toHaveBeenCalledWith('id', validUserId);
      expect(mockBuilder.ilike).toHaveBeenCalledWith('username', '%alice%');
      expect(result).toEqual([mockProfile]);
    });

    it('should return empty array if query is empty or whitespace', async () => {
      const result = await service.searchProfiles('   ', validUserId);
      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should throw error if currentUserId is missing', async () => {
      await expect(service.searchProfiles('alice', '')).rejects.toThrow('Current User ID is required');
    });

    it('should throw error if currentUserId is not valid UUID', async () => {
      await expect(service.searchProfiles('alice', 'invalid-uuid')).rejects.toThrow('Current User ID must be a valid UUID');
    });

    it('should throw error if query fails', async () => {
      mockBuilder.setResult(null, { message: 'Database query failed' });

      await expect(service.searchProfiles('alice', validUserId)).rejects.toThrow('Failed to search profiles: Database query failed');
    });
  });

  describe('getProfilesByIds', () => {
    it('should fetch profiles by user IDs successfully', async () => {
      mockBuilder.setResult([mockProfile]);

      const result = await service.getProfilesByIds([otherUserId]);

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.in).toHaveBeenCalledWith('id', [otherUserId]);
      expect(result).toEqual([mockProfile]);
    });

    it('should return empty array if list of IDs is empty', async () => {
      const result = await service.getProfilesByIds([]);
      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should throw error if any ID is not valid UUID', async () => {
      await expect(service.getProfilesByIds([otherUserId, 'invalid-uuid'])).rejects.toThrow('Profile ID must be a valid UUID');
    });

    it('should throw error if fetch fails', async () => {
      mockBuilder.setResult(null, { message: 'Fetch failed' });

      await expect(service.getProfilesByIds([otherUserId])).rejects.toThrow('Failed to fetch profiles: Fetch failed');
    });
  });

  describe('getProfileByUsername', () => {
    it('should fetch a single profile by username successfully', async () => {
      mockBuilder.setResult(mockProfile);

      const result = await service.getProfileByUsername('alice');

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('username', 'alice');
      expect(mockBuilder.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });

    it('should return null if profile not found', async () => {
      mockBuilder.setResult(null);

      const result = await service.getProfileByUsername('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw error if username is empty', async () => {
      await expect(service.getProfileByUsername('')).rejects.toThrow('Username is required');
    });

    it('should throw error if query fails', async () => {
      mockBuilder.setResult(null, { message: 'Database error' });

      await expect(service.getProfileByUsername('alice')).rejects.toThrow('Failed to fetch profile by username: Database error');
    });
  });
});
