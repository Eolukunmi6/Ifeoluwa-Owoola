-- Phase 4 Database Updates

-- 1. Create tutor_videos table
CREATE TABLE IF NOT EXISTS public.tutor_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.tutor_videos ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for tutor_videos
-- Anyone can view videos
CREATE POLICY "Tutor videos are viewable by everyone."
  ON public.tutor_videos FOR SELECT
  USING (true);

-- Tutors can manage their own videos
CREATE POLICY "Tutors can insert their own videos."
  ON public.tutor_videos FOR INSERT
  WITH CHECK (
    tutor_id IN (
      SELECT id FROM public.tutors WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Tutors can update their own videos."
  ON public.tutor_videos FOR UPDATE
  USING (
    tutor_id IN (
      SELECT id FROM public.tutors WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Tutors can delete their own videos."
  ON public.tutor_videos FOR DELETE
  USING (
    tutor_id IN (
      SELECT id FROM public.tutors WHERE profile_id = auth.uid()
    )
  );

-- 4. Create Storage Bucket for videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tutor-videos', 'tutor-videos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies for tutor-videos
-- I chose to make the bucket public because these are promotional/teaching videos
-- intended to be viewed by parents on the public marketplace in a later phase.
-- Access control will be managed by the application layer if needed.
CREATE POLICY "Tutor videos are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tutor-videos');

CREATE POLICY "Users can upload their own videos."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tutor-videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own videos."
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'tutor-videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own videos."
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'tutor-videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
