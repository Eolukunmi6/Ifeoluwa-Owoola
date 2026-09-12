-- Create the tutor_videos table
CREATE TABLE IF NOT EXISTS public.tutor_videos (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid references public.tutors(id) on delete cascade,
  subject_id uuid references public.subjects(id),
  title text,
  description text,
  video_url text,
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.tutor_videos ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Access
DROP POLICY IF EXISTS "Tutor videos are viewable by everyone." ON public.tutor_videos;
CREATE POLICY "Tutor videos are viewable by everyone." 
  ON public.tutor_videos FOR SELECT 
  USING (true);

-- 2. Insert Access (Tutor only)
DROP POLICY IF EXISTS "Tutors can insert their own videos." ON public.tutor_videos;
CREATE POLICY "Tutors can insert their own videos."
  ON public.tutor_videos FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT profile_id FROM public.tutors WHERE id = tutor_videos.tutor_id
    )
  );

-- 3. Update Access (Tutor only)
DROP POLICY IF EXISTS "Tutors can update their own videos." ON public.tutor_videos;
CREATE POLICY "Tutors can update their own videos."
  ON public.tutor_videos FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT profile_id FROM public.tutors WHERE id = tutor_videos.tutor_id
    )
  );

-- 4. Delete Access (Tutor only)
DROP POLICY IF EXISTS "Tutors can delete their own videos." ON public.tutor_videos;
CREATE POLICY "Tutors can delete their own videos."
  ON public.tutor_videos FOR DELETE
  USING (
    auth.uid() IN (
      SELECT profile_id FROM public.tutors WHERE id = tutor_videos.tutor_id
    )
  );
