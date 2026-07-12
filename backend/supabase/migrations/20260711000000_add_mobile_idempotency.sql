ALTER TABLE public.habit_logs ADD COLUMN IF NOT EXISTS client_operation_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS habit_logs_client_operation_id_unique
  ON public.habit_logs(client_operation_id)
  WHERE client_operation_id IS NOT NULL;
