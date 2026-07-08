-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- requester
    friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- receiver
    status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- 'pending', 'accepted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Design by Contract / Constraints
    CONSTRAINT friendships_not_self CHECK (user_id <> friend_id),
    CONSTRAINT friendships_status_val CHECK (status IN ('pending', 'accepted'))
);

-- Composite unique key on user pairs (enforcing single relationship in any direction)
CREATE UNIQUE INDEX IF NOT EXISTS friendships_unique_user_pairs ON public.friendships (
    LEAST(user_id, friend_id), 
    GREATEST(user_id, friend_id)
);

-- Indexes for querying and relationship performance
CREATE INDEX IF NOT EXISTS friendships_user_id_idx ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_id_idx ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON public.friendships(status);

-- Enable RLS on friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Friendships RLS Policies
CREATE POLICY "Allow users to view their own friendships"
    ON public.friendships FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Allow users to insert friendship requests"
    ON public.friendships FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own friendships"
    ON public.friendships FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = friend_id)
    WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Allow users to delete their own friendships"
    ON public.friendships FOR DELETE
    USING (auth.uid() = user_id OR auth.uid() = friend_id);