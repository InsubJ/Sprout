ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username_set_at TIMESTAMPTZ;

-- Existing chosen usernames become immutable immediately. Accounts still using
-- Sprout's deterministic placeholder receive one onboarding opportunity.
UPDATE public.profiles
SET username_set_at = created_at
WHERE username_set_at IS NULL
  AND username <> 'user_' || SUBSTRING(id::TEXT FROM 1 FOR 12);

CREATE OR REPLACE FUNCTION public.reject_profile_username_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    IF OLD.username_set_at IS NOT NULL THEN
      RAISE EXCEPTION 'Username cannot be changed after it has been set'
        USING ERRCODE = '23514';
    END IF;
    IF CHAR_LENGTH(BTRIM(NEW.username)) NOT BETWEEN 3 AND 50
      OR BTRIM(NEW.username) !~ '^[a-zA-Z0-9_]+$'
    THEN
      RAISE EXCEPTION 'Username must be 3-50 characters using only letters, numbers, or _'
        USING ERRCODE = '23514';
    END IF;
    NEW.username = BTRIM(NEW.username);
    NEW.username_set_at = NOW();
  ELSIF NEW.username_set_at IS DISTINCT FROM OLD.username_set_at THEN
    RAISE EXCEPTION 'Username setup state cannot be changed directly'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reject_profile_username_change ON public.profiles;

CREATE TRIGGER reject_profile_username_change
  BEFORE UPDATE OF username, username_set_at ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.reject_profile_username_change();

REVOKE ALL ON FUNCTION public.reject_profile_username_change() FROM PUBLIC, anon, authenticated;

-- Password signups provide a validated username in user metadata. OAuth
-- accounts fall back to a stable generated username at account creation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, username_set_at)
  VALUES (
    NEW.id,
    CASE
      WHEN CHAR_LENGTH(BTRIM(NEW.raw_user_meta_data->>'username')) BETWEEN 3 AND 50
        AND BTRIM(NEW.raw_user_meta_data->>'username') ~ '^[a-zA-Z0-9_]+$'
      THEN BTRIM(NEW.raw_user_meta_data->>'username')
      ELSE 'user_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 12)
    END,
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
    ),
    CASE
      WHEN CHAR_LENGTH(BTRIM(NEW.raw_user_meta_data->>'username')) BETWEEN 3 AND 50
        AND BTRIM(NEW.raw_user_meta_data->>'username') ~ '^[a-zA-Z0-9_]+$'
      THEN NOW()
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
