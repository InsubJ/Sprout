import type { AsyncStorageStatic } from "@react-native-async-storage/async-storage";
import type { CreateHabitLogInput, Habit, HabitLog } from "@sprout/shared";
import type { HabitRepository, LogRepository } from "@sprout/services";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseLogRepository } from "@sprout/services";
import { DemoLogRepository } from "./demoLogRepository";

const input: CreateHabitLogInput = {
  habit_id: "44444444-4444-4444-4444-444444444444",
  user_id: "33333333-3333-3333-3333-333333333333",
  note: "Contract reflection",
  client_operation_id: "contract-operation-123",
};

function runLogRepositoryContract(name: string, createRepository: () => LogRepository): void {
  describe(`${name} log repository contract`, () => {
    it("enforces ID preconditions and returns null when absent", async () => {
      const repository = createRepository();
      await expect(repository.getById(" ")).rejects.toThrow("Log ID is required");
      await expect(repository.getById("missing-log")).resolves.toBeNull();
    });
    it("returns the same shape for idempotent duplicate creates", async () => {
      const repository = createRepository();
      const first = await repository.create(input);
      const duplicate = await repository.create(input);
      expect(duplicate).toEqual(first);
      expect(first).toMatchObject(input);
      expect(typeof first.id).toBe("string");
      expect(new Date(first.created_at).toString()).not.toBe("Invalid Date");
    });
  });
}

function createStorage(): AsyncStorageStatic {
  const values = new Map<string, string>();
  return {
    getItem: jest.fn(async (key: string) => values.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      values.delete(key);
    }),
    clear: jest.fn(async () => values.clear()),
  } as unknown as AsyncStorageStatic;
}

const habits: HabitRepository = {
  getById: async () => null,
  getByUserId: async () => [],
  create: async () => {
    throw new Error("unused");
  },
  update: async (_id, value) => value as Habit,
};

class FakeLogQuery {
  private column?: string;
  private value?: string;
  private inserted?: CreateHabitLogInput;
  constructor(private readonly logs: HabitLog[]) {}
  select(): this {
    return this;
  }
  eq(column: string, value: string): this {
    this.column = column;
    this.value = value;
    return this;
  }
  insert(inputValue: CreateHabitLogInput): this {
    this.inserted = inputValue;
    return this;
  }
  async maybeSingle(): Promise<{ data: HabitLog | null; error: null }> {
    return {
      data: this.logs.find((item) => item[this.column as keyof HabitLog] === this.value) ?? null,
      error: null,
    };
  }
  async single(): Promise<{
    data: HabitLog | null;
    error: { code: string; message: string } | null;
  }> {
    const duplicate = this.inserted?.client_operation_id
      ? this.logs.find((item) => item.client_operation_id === this.inserted?.client_operation_id)
      : undefined;
    if (duplicate) return { data: null, error: { code: "23505", message: "duplicate key" } };
    const created: HabitLog = {
      ...this.inserted!,
      id: `fixture-${this.logs.length + 1}`,
      created_at: "2026-07-13T00:00:00.000Z",
    };
    this.logs.push(created);
    return { data: created, error: null };
  }
}

runLogRepositoryContract("demo", () => new DemoLogRepository(createStorage(), habits));
runLogRepositoryContract("Supabase-compatible fixture", () => {
  const logs: HabitLog[] = [];
  const client = { from: () => new FakeLogQuery(logs) } as unknown as SupabaseClient;
  return new SupabaseLogRepository(client);
});
