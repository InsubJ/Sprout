import type { Profile } from "@sprout/shared";

export type UpdateProfileInput = Pick<Profile, "id" | "display_name" | "avatar_url">;

export interface ProfileRepository {
  getById(id: string): Promise<Profile | null>;
  search(query: string, excludingUserId: string): Promise<Profile[]>;
  setInitialUsername(userId: string, username: string): Promise<Profile>;
  update(profile: UpdateProfileInput): Promise<Profile>;
}
