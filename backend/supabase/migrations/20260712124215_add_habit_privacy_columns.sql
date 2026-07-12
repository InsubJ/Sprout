ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS hide_name BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hide_description BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS share_name_friends UUID[] NOT NULL DEFAULT '{}'::UUID[],
  ADD COLUMN IF NOT EXISTS share_desc_friends UUID[] NOT NULL DEFAULT '{}'::UUID[];

COMMENT ON COLUMN public.habits.hide_name IS
  'Hide the plant name from visitors except explicitly selected friends.';
COMMENT ON COLUMN public.habits.hide_description IS
  'Hide the plant description from visitors except explicitly selected friends.';
COMMENT ON COLUMN public.habits.share_name_friends IS
  'Friend profile IDs allowed to see a hidden plant name.';
COMMENT ON COLUMN public.habits.share_desc_friends IS
  'Friend profile IDs allowed to see a hidden plant description.';
