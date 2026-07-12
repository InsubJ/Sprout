import type { Profile } from '@sprout/shared';
export interface ProfileRepository { getById(id: string): Promise<Profile | null>; search(query: string, excludingUserId: string): Promise<Profile[]>; update(profile: Profile): Promise<Profile>; }
