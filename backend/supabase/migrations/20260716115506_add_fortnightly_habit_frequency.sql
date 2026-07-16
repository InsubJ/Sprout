alter table public.habits
  drop constraint if exists habits_frequency_val;

alter table public.habits
  add constraint habits_frequency_val
  check (
    frequency in (
      'twice_daily',
      'daily',
      'weekly',
      'fortnightly',
      'monthly',
      'yearly',
      'flexible'
    )
  );
