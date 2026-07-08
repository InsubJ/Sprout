-- Create habit_logs table
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for querying and relationship performance
CREATE INDEX IF NOT EXISTS habit_logs_habit_id_idx ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS habit_logs_user_id_idx ON public.habit_logs(user_id);
CREATE INDEX IF NOT EXISTS habit_logs_created_at_idx ON public.habit_logs(created_at);

-- Enable RLS on habit_logs
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- Habit logs RLS Policies
CREATE POLICY "Allow users to read their own habit logs"
    ON public.habit_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own habit logs"
    ON public.habit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own habit logs"
    ON public.habit_logs FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to automatically update current_waterings and current_streak on habits
CREATE OR REPLACE FUNCTION public.handle_habit_log_insert()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.habits
    SET current_waterings = LEAST(target_waterings, current_waterings + 1),
        current_streak = current_streak + 1,
        max_streak = GREATEST(max_streak, current_streak + 1),
        status = CASE 
            WHEN current_waterings + 1 >= target_waterings THEN 'completed'::varchar 
            ELSE status 
        END,
        completed_at = CASE 
            WHEN current_waterings + 1 >= target_waterings AND completed_at IS NULL THEN NOW() 
            ELSE completed_at 
        END
    WHERE id = NEW.habit_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_habit_log_created
    AFTER INSERT ON public.habit_logs
    FOR EACH ROW EXECUTE FUNCTION public.handle_habit_log_insert();
