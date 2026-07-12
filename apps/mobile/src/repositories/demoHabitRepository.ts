import type { CreateHabitInput, Habit, UpdateHabitInput } from "@sprout/shared";
import {
  assignSpecies,
  getDifficultyTier,
  validateCreateHabitInput,
} from "@sprout/shared";
import type { HabitRepository } from "@sprout/services";
const userId = "11111111-1111-1111-1111-111111111111";
let habits: Habit[] = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    user_id: userId,
    name: "Morning walk",
    description: "Step outside before starting the day",
    plant_type: "pothos",
    difficulty_tier: "common",
    frequency: "daily",
    flexible_rules: null,
    target_waterings: 14,
    current_waterings: 5,
    wither_threshold: 3,
    consecutive_misses: 0,
    wither_count: 0,
    status: "healthy",
    poetic_summary: null,
    is_public: true,
    current_streak: 5,
    max_streak: 5,
    completed_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    user_id: userId,
    name: "Read ten pages",
    description: "Make a little room for another world",
    plant_type: "lavender",
    difficulty_tier: "uncommon",
    frequency: "daily",
    flexible_rules: null,
    target_waterings: 12,
    current_waterings: 12,
    wither_threshold: 3,
    consecutive_misses: 0,
    wither_count: 1,
    status: "completed",
    poetic_summary: "Twelve quiet returns turned scattered minutes into a reading ritual.",
    is_public: true,
    current_streak: 8,
    max_streak: 8,
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    user_id: "33333333-3333-3333-3333-333333333333",
    name: "Evening stretch",
    description: "Unwind with a gentle stretch before bed",
    plant_type: "spider_plant",
    difficulty_tier: "common",
    frequency: "daily",
    flexible_rules: null,
    target_waterings: 10,
    current_waterings: 3,
    wither_threshold: 3,
    consecutive_misses: 3,
    wither_count: 1,
    status: "withered",
    poetic_summary: null,
    is_public: true,
    current_streak: 0,
    max_streak: 4,
    completed_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    user_id: "33333333-3333-3333-3333-333333333333",
    name: "Read before bed",
    description: "Ten quiet pages each evening",
    plant_type: "lavender",
    difficulty_tier: "uncommon",
    frequency: "daily",
    flexible_rules: null,
    target_waterings: 12,
    current_waterings: 12,
    wither_threshold: 3,
    consecutive_misses: 0,
    wither_count: 1,
    status: "completed",
    poetic_summary: "A dozen evenings made room for quieter thoughts.",
    is_public: true,
    current_streak: 8,
    max_streak: 8,
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];
export class DemoHabitRepository implements HabitRepository {
  async getById(id: string): Promise<Habit | null> {
    if (!id.trim()) throw new Error("Habit ID is required");
    return habits.find((h) => h.id === id) ?? null;
  }
  async getByUserId(requestedUserId: string): Promise<Habit[]> {
    if (!requestedUserId.trim()) throw new Error("User ID is required");
    return habits.filter((h) => h.user_id === requestedUserId);
  }
  async create(input: CreateHabitInput): Promise<Habit> {
    const validation = validateCreateHabitInput(input);
    if (!validation.success)
      throw new Error(validation.errors?.[0]?.message ?? "Invalid habit");
    const difficulty =
      input.difficulty_tier ??
      getDifficultyTier({
        frequency: input.frequency ?? "daily",
        target_waterings: input.target_waterings ?? 30,
        wither_threshold: input.wither_threshold ?? 3,
      });
    const habit: Habit = {
      id: `${Date.now()}-demo-habit`,
      user_id: input.user_id,
      name: input.name.trim(),
      description: input.description ?? null,
      plant_type: input.plant_type ?? assignSpecies(difficulty),
      difficulty_tier: difficulty,
      frequency: input.frequency ?? "daily",
      flexible_rules: input.flexible_rules ?? null,
      target_waterings: input.target_waterings ?? 30,
      current_waterings: 0,
      wither_threshold: input.wither_threshold ?? 3,
      consecutive_misses: 0,
      wither_count: 0,
      status: "healthy",
      poetic_summary: null,
      is_public: input.is_public ?? true,
      current_streak: 0,
      max_streak: 0,
      completed_at: null,
      created_at: new Date().toISOString(),
    };
    habits = [habit, ...habits];
    return habit;
  }
  async update(id: string, input: UpdateHabitInput): Promise<Habit> {
    const existing = habits.find((h) => h.id === id);
    if (!existing) throw new Error("Habit not found");
    const updated = { ...existing, ...input };
    habits = habits.map((h) => (h.id === id ? updated : h));
    return updated;
  }
}
