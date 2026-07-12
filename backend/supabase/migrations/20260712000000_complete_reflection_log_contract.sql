ALTER TABLE public.habit_logs
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

DROP POLICY IF EXISTS "Connected buds can read public habit logs" ON public.habit_logs;
CREATE POLICY "Connected buds can read public habit logs"
  ON public.habit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.habits h
      WHERE h.id = habit_logs.habit_id
        AND h.is_public = TRUE
        AND EXISTS (
          SELECT 1
          FROM public.friendships f
          WHERE f.status = 'accepted'
            AND (
              (f.user_id = auth.uid() AND f.friend_id = h.user_id)
              OR (f.friend_id = auth.uid() AND f.user_id = h.user_id)
            )
        )
    )
  );

COMMENT ON COLUMN public.habit_logs.note IS 'Optional reflection recorded during watering.';
COMMENT ON COLUMN public.habit_logs.image_url IS 'Optional stored reflection image URL.';
