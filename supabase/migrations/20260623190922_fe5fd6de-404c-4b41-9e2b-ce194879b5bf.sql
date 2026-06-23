
-- RLS policies for the "apks" storage bucket.
-- This app does not (yet) have user authentication, so we allow anonymous
-- access to manage objects in this bucket only. The admin should later
-- restrict these to authenticated users with an "admin" role.

CREATE POLICY "Anyone can read apks bucket"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'apks');

CREATE POLICY "Anyone can upload to apks bucket"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'apks');

CREATE POLICY "Anyone can update apks bucket"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'apks')
WITH CHECK (bucket_id = 'apks');

CREATE POLICY "Anyone can delete from apks bucket"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'apks');
