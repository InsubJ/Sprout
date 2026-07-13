import type { AsyncStorageStatic } from "@react-native-async-storage/async-storage";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  RepositoryError,
  SupabaseHabitRepository,
  SupabaseInteractionRepository,
  SupabaseProfileRepository,
  SupabaseSocialRepository,
  type HabitRepository,
  type InteractionRepository,
  type ProfileRepository,
  type SocialRepository,
} from "@sprout/services";
import { DemoHabitRepository } from "./demoHabitRepository";
import { DemoInteractionRepository } from "./demoInteractionRepository";
import { DemoProfileRepository } from "./demoProfileRepository";
import { DemoSocialRepository } from "./demoSocialRepository";

function storage(): AsyncStorageStatic {
  const values = new Map<string, string>();
  return {
    getItem: jest.fn(async (key: string) => values.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: jest.fn(),
    clear: jest.fn(),
  } as unknown as AsyncStorageStatic;
}
class EmptyQuery {
  data: unknown[] = [];
  error = null;
  count = 0;
  private inserted?: Record<string, unknown>;
  constructor(private readonly friendships: Record<string, unknown>[] = []) {}
  select(): this {
    return this;
  }
  eq(): this {
    return this;
  }
  neq(): this {
    return this;
  }
  ilike(): this {
    return this;
  }
  limit(): this {
    return this;
  }
  order(): this {
    return this;
  }
  or(): this {
    return this;
  }
  gte(): this {
    return this;
  }
  lte(): this {
    return this;
  }
  update(): this {
    return this;
  }
  delete(): this {
    return this;
  }
  insert(value: Record<string, unknown>): this {
    this.inserted = value;
    return this;
  }
  async maybeSingle(): Promise<{ data: null; error: null }> {
    return { data: null, error: null };
  }
  async single(): Promise<{
    data: Record<string, unknown> | null;
    error: { code: string; message: string } | null;
  }> {
    if (this.inserted?.user_id && this.inserted?.friend_id) {
      const duplicate = this.friendships.some(
        (item) =>
          (item.user_id === this.inserted?.user_id &&
            item.friend_id === this.inserted?.friend_id) ||
          (item.user_id === this.inserted?.friend_id && item.friend_id === this.inserted?.user_id),
      );
      if (duplicate) return { data: null, error: { code: "23505", message: "duplicate" } };
      const row = {
        ...this.inserted,
        id: `fixture-${this.friendships.length}`,
        created_at: "2026-07-13T00:00:00.000Z",
      };
      this.friendships.push(row);
      return { data: row, error: null };
    }
    return {
      data: this.inserted
        ? { ...this.inserted, id: "fixture-id", created_at: "2026-07-13T00:00:00.000Z" }
        : null,
      error: null,
    };
  }
}
function client(): SupabaseClient {
  const friendships: Record<string, unknown>[] = [];
  return { from: () => new EmptyQuery(friendships) } as unknown as SupabaseClient;
}
async function expectCategory(
  promise: Promise<unknown>,
  category: RepositoryError["category"],
): Promise<void> {
  await expect(promise).rejects.toMatchObject({ category });
}

const habitFactories: Array<[string, () => HabitRepository]> = [
  ["demo", () => new DemoHabitRepository()],
  ["supabase", () => new SupabaseHabitRepository(client())],
];
describe.each(habitFactories)("%s habit contract", (_name, factory) => {
  it("shares validation and not-found behavior", async () => {
    const repository = factory();
    await expectCategory(repository.getById(" "), "validation");
    await expect(repository.getById("99999999-9999-9999-9999-999999999999")).resolves.toBeNull();
    await expect(repository.getByUserId("99999999-9999-9999-9999-999999999999")).resolves.toEqual(
      [],
    );
  });
});

const profileFactories: Array<[string, () => ProfileRepository]> = [
  ["demo", () => new DemoProfileRepository()],
  ["supabase", () => new SupabaseProfileRepository(client())],
];
describe.each(profileFactories)("%s profile contract", (_name, factory) => {
  it("shares validation, empty search, and not-found behavior", async () => {
    const repository = factory();
    await expectCategory(repository.getById(" "), "validation");
    await expect(repository.getById("99999999-9999-9999-9999-999999999999")).resolves.toBeNull();
    await expect(repository.search("", "user-id")).resolves.toEqual([]);
    await expectCategory(repository.search("willow", " "), "validation");
  });
});

const interactionFactories: Array<[string, () => InteractionRepository]> = [
  ["demo", () => new DemoInteractionRepository(storage())],
  ["supabase", () => new SupabaseInteractionRepository(client())],
];
describe.each(interactionFactories)("%s interaction contract", (_name, factory) => {
  it("shares empty shapes and input categories", async () => {
    const repository = factory();
    await expect(repository.getComments("missing")).resolves.toEqual([]);
    await expect(repository.getReactions("missing")).resolves.toEqual([]);
    await expectCategory(
      repository.createComment({ log_id: "", user_id: "", content: "" }),
      "validation",
    );
    await expectCategory(
      repository.toggleReaction({ log_id: "", user_id: "", reaction_type: "" }),
      "validation",
    );
  });
});

const socialFactories: Array<[string, () => SocialRepository]> = [
  ["demo", () => new DemoSocialRepository(storage())],
  ["supabase", () => new SupabaseSocialRepository(client())],
];
describe.each(socialFactories)("%s social contract", (_name, factory) => {
  it("shares request shapes, duplicate behavior, and validation categories", async () => {
    const repository = factory();
    await expectCategory(repository.getFriendships(" "), "validation");
    const first = await repository.sendFriendRequest(
      "dddddddd-dddd-dddd-dddd-dddddddddddd",
      "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    );
    expect(first).toMatchObject({
      user_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      friend_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
      status: "pending",
    });
    await expectCategory(
      repository.sendFriendRequest(
        "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
      ),
      "conflict",
    );
  });
});
