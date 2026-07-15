import type { Profile } from "@sprout/shared";
import { RepositoryError, type ProfileRepository, type UpdateProfileInput } from "@sprout/services";

const createdAt = "2026-01-01T00:00:00.000Z";
let profiles: Profile[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    username: "admin",
    display_name: "Admin Gardener",
    avatar_url: null,
    created_at: createdAt,
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    username: "alice",
    display_name: "Alice",
    avatar_url: null,
    created_at: createdAt,
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    username: "bob",
    display_name: "Bob",
    avatar_url: null,
    created_at: createdAt,
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    username: "charlie",
    display_name: "Charlie",
    avatar_url: null,
    created_at: createdAt,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    username: "willow",
    display_name: "Willow",
    avatar_url: null,
    created_at: createdAt,
  },
];

export class DemoProfileRepository implements ProfileRepository {
  async getById(id: string): Promise<Profile | null> {
    if (!id.trim()) throw new RepositoryError("Profile ID is required", "validation");
    return profiles.find((profile) => profile.id === id) ?? null;
  }

  async search(query: string, excludingUserId: string): Promise<Profile[]> {
    if (!excludingUserId.trim())
      throw new RepositoryError("Current user ID is required", "validation");
    const normalized = query.trim().replace(/^@/, "").toLowerCase();
    if (!normalized) return [];
    return profiles.filter(
      (profile) =>
        profile.id !== excludingUserId &&
        (profile.username.includes(normalized) ||
          profile.display_name?.toLowerCase().includes(normalized)),
    );
  }

  async setInitialUsername(userId: string, username: string): Promise<Profile> {
    if (!userId.trim() || username.trim().length < 3)
      throw new RepositoryError("A valid profile and username are required", "validation");
    const current = profiles.find((item) => item.id === userId);
    if (!current) throw new RepositoryError("Profile not found", "not_found");
    if (current.username_set_at !== null)
      throw new RepositoryError("Username has already been set", "conflict");
    const updated: Profile = {
      ...current,
      username: username.trim(),
      username_set_at: new Date().toISOString(),
    };
    profiles = profiles.map((item) => (item.id === userId ? updated : item));
    return updated;
  }

  async update(profile: UpdateProfileInput): Promise<Profile> {
    if (!profile.id.trim()) throw new RepositoryError("A valid profile is required", "validation");
    const current = profiles.find((item) => item.id === profile.id);
    if (!current) throw new RepositoryError("Profile not found", "not_found");
    const updated: Profile = { ...current, ...profile };
    profiles = profiles.map((item) => (item.id === profile.id ? updated : item));
    return updated;
  }
}
