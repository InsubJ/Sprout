import type { SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
export async function restoreSession(client: SupabaseClient): Promise<Session | null> {
  if (!client) throw new Error("Supabase client is required");
  const { data, error } = await client.auth.getSession();
  if (error) throw new Error(`Unable to restore session: ${error.message}`);
  return data.session;
}
export async function signOutSession(client: SupabaseClient): Promise<void> {
  if (!client) throw new Error("Supabase client is required");
  const { error } = await client.auth.signOut();
  if (error) throw new Error(`Unable to sign out: ${error.message}`);
}
