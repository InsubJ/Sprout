import type { Profile } from "@sprout/shared";
import type { ProfileRepository } from "@sprout/services";

const createdAt = "2026-01-01T00:00:00.000Z";
let profiles: Profile[] = [
  { id: "11111111-1111-1111-1111-111111111111", username: "admin", display_name: "Admin Gardener", avatar_url: null, created_at: createdAt },
  { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", username: "alice", display_name: "Alice", avatar_url: null, created_at: createdAt },
  { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", username: "bob", display_name: "Bob", avatar_url: null, created_at: createdAt },
  { id: "cccccccc-cccc-cccc-cccc-cccccccccccc", username: "charlie", display_name: "Charlie", avatar_url: null, created_at: createdAt },
  { id: "33333333-3333-3333-3333-333333333333", username: "willow", display_name: "Willow", avatar_url: null, created_at: createdAt },
];

export class DemoProfileRepository implements ProfileRepository {
  async getById(id: string): Promise<Profile | null> {
    if (!id.trim()) throw new Error("Profile ID is required");
    return profiles.find((profile) => profile.id === id) ?? null;
  }

  async search(query: string, excludingUserId: string): Promise<Profile[]> {
    const normalized = query.trim().replace(/^@/, "").toLowerCase();
    if (!normalized) return [];
    return profiles.filter((profile) => profile.id !== excludingUserId && (profile.username.includes(normalized) || profile.display_name?.toLowerCase().includes(normalized)));
  }

  async update(profile: Profile): Promise<Profile> {
    if (!profile.id.trim() || profile.username.trim().length < 3) throw new Error("A valid profile is required");
    profiles = profiles.some((item) => item.id === profile.id) ? profiles.map((item) => item.id === profile.id ? profile : item) : [...profiles, profile];
    return profile;
  }
}
