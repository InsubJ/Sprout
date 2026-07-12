import type { CreateHabitInput, Habit, UpdateHabitInput } from '@sprout/shared';
import { validateCreateHabitInput, validateUpdateHabitInput } from '@sprout/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { HabitRepository } from '../repositories/habitRepository';
export class SupabaseHabitRepository implements HabitRepository {
  constructor(private readonly client: SupabaseClient) { if (!client) throw new Error('Supabase client is required'); }
  async getById(id: string): Promise<Habit | null> { if (!id.trim()) throw new Error('Habit ID is required'); const { data, error } = await this.client.from('habits').select('*').eq('id', id).maybeSingle(); if (error) throw new Error(`Unable to load habit: ${error.message}`); return data as Habit | null; }
  async getByUserId(userId: string): Promise<Habit[]> {
    if (!userId.trim()) throw new Error('User ID is required');
    const { data, error } = await this.client.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw new Error(`Unable to load habits: ${error.message}`);
    return (data ?? []) as Habit[];
  }
  async create(input: CreateHabitInput): Promise<Habit> {
    const result = validateCreateHabitInput(input); if (!result.success) throw new Error(result.errors?.[0]?.message ?? 'Invalid habit');
    const { data, error } = await this.client.from('habits').insert(input).select().single();
    if (error) throw new Error(`Unable to create habit: ${error.message}`); return data as Habit;
  }
  async update(id: string, input: UpdateHabitInput): Promise<Habit> {
    if (!id.trim()) throw new Error('Habit ID is required');
    const result = validateUpdateHabitInput(input); if (!result.success) throw new Error(result.errors?.[0]?.message ?? 'Invalid habit update');
    const { data, error } = await this.client.from('habits').update(input).eq('id', id).select().single();
    if (error) throw new Error(`Unable to update habit: ${error.message}`); return data as Habit;
  }
}
