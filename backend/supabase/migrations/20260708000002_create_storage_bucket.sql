-- Ensure storage.objects has RLS enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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

-- RLS policies for habit-photos bucket in storage.objects

-- Allow anyone to view/read objects in the habit-photos bucket
CREATE POLICY "Allow public read access to habit-photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'habit-photos');

-- Allow authenticated users to upload objects to a folder named after their user ID
CREATE POLICY "Allow users to upload photos to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'habit-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update objects inside their own folder
CREATE POLICY "Allow users to update photos in their own folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'habit-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'habit-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete objects from their own folder
CREATE POLICY "Allow users to delete photos from their own folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'habit-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
