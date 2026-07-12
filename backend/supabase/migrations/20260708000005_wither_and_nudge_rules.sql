-- Create wither_nudges table (once per day per friend, per withered tree)
CREATE TABLE IF NOT EXISTS public.wither_nudges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
    nudged_at DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (sender_id, habit_id, nudged_at)
);

-- Index for querying nudges by habit or sender/receiver
CREATE INDEX IF NOT EXISTS wither_nudges_habit_id_idx ON public.wither_nudges(habit_id);
CREATE INDEX IF NOT EXISTS wither_nudges_sender_id_idx ON public.wither_nudges(sender_id);
CREATE INDEX IF NOT EXISTS wither_nudges_receiver_id_idx ON public.wither_nudges(receiver_id);

-- Enable RLS on wither_nudges
ALTER TABLE public.wither_nudges ENABLE ROW LEVEL SECURITY;

-- Wither nudges RLS Policies
CREATE POLICY "Allow users to read nudges they sent or received"
    ON public.wither_nudges FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Allow users to insert their own nudges"
    ON public.wither_nudges FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Trigger to automatically update plant status to withered when missed limit is reached or exceeded
CREATE OR REPLACE FUNCTION public.handle_habit_wither_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Transition status to withered if healthy and consecutive_misses meets/exceeds wither_threshold
    IF NEW.status = 'healthy' AND NEW.consecutive_misses >= NEW.wither_threshold THEN
        NEW.status := 'withered';
        NEW.wither_count := NEW.wither_count + 1;
    END IF;

    -- Revive plant status back to healthy if consecutive_misses is reset below wither_threshold
    IF NEW.status = 'withered' AND NEW.consecutive_misses < NEW.wither_threshold THEN
        NEW.status := 'healthy';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_habit_wither_transition
    BEFORE UPDATE ON public.habits
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_habit_wither_transition();

-- Trigger to enforce preconditions on sending a nudge
CREATE OR REPLACE FUNCTION public.check_wither_nudge_preconditions()
RETURNS TRIGGER AS $$
DECLARE
    habit_rec RECORD;
    is_friend BOOLEAN;
BEGIN
    -- 1. Fetch the habit and check existence
    SELECT user_id, status INTO habit_rec
    FROM public.habits
    WHERE id = NEW.habit_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Habit does not exist' USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- 2. Verify receiver owns the habit
    IF NEW.receiver_id <> habit_rec.user_id THEN
        RAISE EXCEPTION 'Receiver must be the owner of the habit';
    END IF;

    -- 3. Verify sender is not the owner (no self-nudge)
    IF NEW.sender_id = habit_rec.user_id THEN
        RAISE EXCEPTION 'Cannot nudge your own habit';
    END IF;

    -- 4. Verify habit status is withered
    IF habit_rec.status <> 'withered' THEN
        RAISE EXCEPTION 'Cannot nudge a habit that is not withered';
    END IF;

    -- 5. Verify mutual friendship is accepted
    SELECT EXISTS (
        SELECT 1 FROM public.friendships
        WHERE status = 'accepted' AND (
            (user_id = NEW.sender_id AND friend_id = NEW.receiver_id) OR
            (user_id = NEW.receiver_id AND friend_id = NEW.sender_id)
        )
    ) INTO is_friend;

    IF NOT is_friend THEN
        RAISE EXCEPTION 'Users must be friends to send a nudge';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER before_wither_nudge_insert
    BEFORE INSERT ON public.wither_nudges
    FOR EACH ROW
    EXECUTE FUNCTION public.check_wither_nudge_preconditions();
