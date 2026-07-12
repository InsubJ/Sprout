-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT username_min_length CHECK (char_length(username) >= 3)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Allow public read access to profiles"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Allow users to insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create habits table (representing individual plants)
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    plant_type VARCHAR(50) DEFAULT 'bonsai' NOT NULL,
    difficulty_tier VARCHAR(20) DEFAULT 'common' NOT NULL,
    frequency VARCHAR(20) DEFAULT 'daily' NOT NULL,
    flexible_rules JSONB,
    target_waterings INT DEFAULT 30 NOT NULL,
    current_waterings INT DEFAULT 0 NOT NULL,
    wither_threshold INT DEFAULT 3 NOT NULL,
    consecutive_misses INT DEFAULT 0 NOT NULL,
    wither_count INT DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'healthy' NOT NULL,
    poetic_summary TEXT,
    is_public BOOLEAN DEFAULT true NOT NULL,
    current_streak INT DEFAULT 0 NOT NULL,
    max_streak INT DEFAULT 0 NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Invariants & Design by Contract
    CONSTRAINT habits_name_not_empty CHECK (char_length(trim(name)) > 0),
    CONSTRAINT habits_difficulty_tier_val CHECK (difficulty_tier IN ('common', 'uncommon', 'rare', 'mythical')),
    CONSTRAINT habits_frequency_val CHECK (frequency IN ('twice_daily', 'daily', 'weekly', 'monthly', 'yearly', 'flexible')),
    CONSTRAINT habits_status_val CHECK (status IN ('healthy', 'withered', 'completed')),
    CONSTRAINT habits_target_waterings_positive CHECK (target_waterings > 0),
    CONSTRAINT habits_current_waterings_non_negative CHECK (current_waterings >= 0),
    CONSTRAINT habits_current_waterings_lte_target CHECK (current_waterings <= target_waterings),
    CONSTRAINT habits_wither_threshold_positive CHECK (wither_threshold > 0),
    CONSTRAINT habits_consecutive_misses_non_negative CHECK (consecutive_misses >= 0),
    CONSTRAINT habits_wither_count_non_negative CHECK (wither_count >= 0),
    CONSTRAINT habits_current_streak_non_negative CHECK (current_streak >= 0),
    CONSTRAINT habits_max_streak_non_negative CHECK (max_streak >= current_streak),
    CONSTRAINT habits_max_streak_gte_current CHECK (max_streak >= current_streak)
);

-- Indexes for querying and relationship performance
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS habits_status_idx ON public.habits(status);

-- Enable RLS on habits
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Habits RLS Policies
CREATE POLICY "Allow public read access to habits if public"
    ON public.habits FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own habits"
    ON public.habits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own habits"
    ON public.habits FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Ensure cascading deletes work correctly by allowing deleting habits owned by the user
CREATE POLICY "Allow users to delete their own habits"
    ON public.habits FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::text FROM 1 FOR 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind handle_new_user function to auth.users trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();