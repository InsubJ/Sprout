-- Users who authenticated before the profiles trigger was installed need a
-- matching profile before their habits can satisfy habits_user_id_fkey.
INSERT INTO public.profiles (id, username, display_name, avatar_url)
SELECT
  users.id,
  'user_' || SUBSTRING(users.id::TEXT FROM 1 FOR 12),
  COALESCE(
    users.raw_user_meta_data->>'display_name',
    users.raw_user_meta_data->>'full_name',
    users.raw_user_meta_data->>'name',
    'Sprout Gardener'
  ),
  COALESCE(
    users.raw_user_meta_data->>'avatar_url',
    users.raw_user_meta_data->>'picture',
    ''
  )
FROM auth.users AS users
LEFT JOIN public.profiles AS profiles ON profiles.id = users.id
WHERE profiles.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Keep future OAuth and password users under the same profile contract.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    'user_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 12),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'Sprout Gardener'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
