-- Insert habit-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'habit-photos',
    'habit-photos',
    true,
    5242880, -- 5MB limit in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policies for Supabase-managed storage.objects must be installed through
-- the hosted Dashboard. See backend/supabase/storage-policies.sql.
