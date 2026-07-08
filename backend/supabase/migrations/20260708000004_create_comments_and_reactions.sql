-- Create log_comments table
CREATE TABLE IF NOT EXISTS public.log_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    log_id UUID REFERENCES public.habit_logs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Design by Contract / Constraints
    CONSTRAINT log_comments_content_not_empty CHECK (char_length(trim(content)) > 0)
);

-- Indexes for querying and relationship performance
CREATE INDEX IF NOT EXISTS log_comments_log_id_idx ON public.log_comments(log_id);
CREATE INDEX IF NOT EXISTS log_comments_user_id_idx ON public.log_comments(user_id);
CREATE INDEX IF NOT EXISTS log_comments_created_at_idx ON public.log_comments(created_at);

-- Enable RLS on log_comments
ALTER TABLE public.log_comments ENABLE ROW LEVEL SECURITY;

-- Log comments RLS Policies
CREATE POLICY "Allow public read access to comments"
    ON public.log_comments FOR SELECT
    USING (true);

CREATE POLICY "Allow users to insert their own comments"
    ON public.log_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own comments"
    ON public.log_comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own comments"
    ON public.log_comments FOR DELETE
    USING (auth.uid() = user_id);


-- Create log_reactions table
CREATE TABLE IF NOT EXISTS public.log_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    log_id UUID REFERENCES public.habit_logs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reaction_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Design by Contract / Constraints
    CONSTRAINT log_reactions_type_not_empty CHECK (char_length(trim(reaction_type)) > 0),
    CONSTRAINT log_reactions_unique_user_reaction UNIQUE (log_id, user_id, reaction_type)
);

-- Indexes for querying and relationship performance
CREATE INDEX IF NOT EXISTS log_reactions_log_id_idx ON public.log_reactions(log_id);
CREATE INDEX IF NOT EXISTS log_reactions_user_id_idx ON public.log_reactions(user_id);
CREATE INDEX IF NOT EXISTS log_reactions_type_idx ON public.log_reactions(reaction_type);

-- Enable RLS on log_reactions
ALTER TABLE public.log_reactions ENABLE ROW LEVEL SECURITY;

-- Log reactions RLS Policies
CREATE POLICY "Allow public read access to reactions"
    ON public.log_reactions FOR SELECT
    USING (true);

CREATE POLICY "Allow users to insert their own reactions"
    ON public.log_reactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own reactions"
    ON public.log_reactions FOR DELETE
    USING (auth.uid() = user_id);
