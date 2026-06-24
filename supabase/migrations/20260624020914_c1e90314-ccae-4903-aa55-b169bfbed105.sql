
CREATE POLICY "midias_read_all" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'midias');

CREATE POLICY "midias_insert_all" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'midias');

CREATE POLICY "midias_update_all" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'midias') WITH CHECK (bucket_id = 'midias');

CREATE POLICY "midias_delete_all" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'midias');
