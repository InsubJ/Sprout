import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
export interface SupabaseConfiguration { url: string; anonKey: string; storage?: KeyValueStorage }
export function createSproutSupabaseClient(config: SupabaseConfiguration): SupabaseClient<Database> {
  if (!config.url.trim()) throw new Error('Supabase URL is required');
  if (!config.anonKey.trim()) throw new Error('Supabase anonymous key is required');
  return createClient<Database>(config.url, config.anonKey, { auth: { storage: config.storage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce' } });
}
