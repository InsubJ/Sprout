-- Run this file once in the hosted Supabase Dashboard SQL Editor after db push.
-- The Dashboard has the managed-schema authority unavailable to CLI db push.

CREATE POLICY "Allow users to read habit photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'habit-photos'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

CREATE POLICY "Allow users to upload photos to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'habit-photos'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

CREATE POLICY "Allow users to update photos in their own folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'habit-photos'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'habit-photos'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

CREATE POLICY "Allow users to delete photos from their own folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'habit-photos'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
