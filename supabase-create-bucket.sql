-- Phase 6 Update: Create tutor-videos bucket and set policies

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tutor-videos',
  'tutor-videos',
  true,
  104857600, -- 100MB limit for videos
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies
-- Give everyone read access
DROP POLICY IF EXISTS "Public access to tutor-videos" ON storage.objects;
CREATE POLICY "Public access to tutor-videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tutor-videos');

-- Allow authenticated uploads
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tutor-videos' AND 
    auth.role() = 'authenticated'
  );

-- Allow owners to update their videos
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
CREATE POLICY "Users can update their own videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'tutor-videos' AND 
    owner = auth.uid()
  );

-- Allow owners to delete their videos
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
CREATE POLICY "Users can delete their own videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'tutor-videos' AND 
    owner = auth.uid()
  );
