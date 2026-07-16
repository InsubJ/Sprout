do $$
declare
  realtime_table text;
begin
  foreach realtime_table in array array[
    'profiles',
    'friendships',
    'habits',
    'habit_logs',
    'custom_plants',
    'log_comments',
    'log_reactions'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = realtime_table
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        realtime_table
      );
    end if;
  end loop;
end
$$;
