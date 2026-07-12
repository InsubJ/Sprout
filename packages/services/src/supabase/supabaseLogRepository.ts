import type { CreateHabitLogInput, HabitLog } from '@sprout/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LogRepository } from '../repositories/logRepository';
export class SupabaseLogRepository implements LogRepository {
  constructor(private readonly client: SupabaseClient) { if (!client) throw new Error('Supabase client is required'); }
  async getById(id: string): Promise<HabitLog | null> { if (!id.trim()) throw new Error('Log ID is required'); const { data, error } = await this.client.from('habit_logs').select('*').eq('id', id).maybeSingle(); if (error) throw new Error(`Unable to load reflection: ${error.message}`); return data as HabitLog | null; }
  async getByHabitId(habitId: string): Promise<HabitLog[]> {
    if (!habitId.trim()) throw new Error('Habit ID is required');
    const { data, error } = await this.client.from('habit_logs').select('*').eq('habit_id', habitId).order('created_at', { ascending: false });
    if (error) throw new Error(`Unable to load reflections: ${error.message}`);
    return (data ?? []) as HabitLog[];
  }
  async countForHabitOnDate(habitId: string, dateKey: string): Promise<number> {
    if (!habitId.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) throw new Error('A habit ID and ISO date are required');
    const from = `${dateKey}T00:00:00.000Z`; const to = `${dateKey}T23:59:59.999Z`;
    const { count, error } = await this.client.from('habit_logs').select('id', { count: 'exact', head: true }).eq('habit_id', habitId).gte('created_at', from).lte('created_at', to);
    if (error) throw new Error(`Unable to count watering logs: ${error.message}`); return count ?? 0;
  }
  async create(input: CreateHabitLogInput): Promise<HabitLog> {
    if (!input.habit_id.trim() || !input.user_id.trim()) throw new Error('Habit and user IDs are required');
    const databaseInput = {
      habit_id: input.habit_id,
      user_id: input.user_id,
      ...(input.note ? { note: input.note } : {}),
      ...(input.image_url ? { image_url: input.image_url } : {}),
      ...(input.client_operation_id ? { client_operation_id: input.client_operation_id } : {}),
    };
    const { data, error } = await this.client.from('habit_logs').insert(databaseInput).select().single();
    if (error) throw new Error(`Unable to water habit: ${error.message}`); return data as HabitLog;
  }
}
