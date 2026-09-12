-- Run this in the Supabase SQL Editor for Phase 3

-- 1. Extend tutors table
ALTER TABLE public.tutors
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS certification TEXT,
ADD COLUMN IF NOT EXISTS experience INTEGER,
ADD COLUMN IF NOT EXISTS teaching_age_min INTEGER,
ADD COLUMN IF NOT EXISTS teaching_age_max INTEGER,
ADD COLUMN IF NOT EXISTS introduction_video TEXT,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- 2. Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true
);

-- 3. Seed subjects
INSERT INTO public.subjects (name) VALUES 
  ('Numeracy'),
  ('Literacy'),
  ('Basic Science'),
  ('Music'),
  ('Phonics'),
  ('Art & Craft'),
  ('Computer & Coding'),
  ('High School Final Exam')
ON CONFLICT (name) DO NOTHING;

-- 4. Create tutor_subjects join table
CREATE TABLE IF NOT EXISTS public.tutor_subjects (
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (tutor_id, subject_id)
);

-- 5. Row Level Security for tutor_subjects and subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_subjects ENABLE ROW LEVEL SECURITY;

-- Subjects Policies (Publicly readable)
CREATE POLICY "Subjects are viewable by everyone."
  ON public.subjects FOR SELECT
  USING (true);

-- Tutor_Subjects Policies (Public read, tutor write)
CREATE POLICY "Tutor subjects are viewable by everyone."
  ON public.tutor_subjects FOR SELECT
  USING (true);

CREATE POLICY "Tutors can manage their own subjects."
  ON public.tutor_subjects FOR ALL
  USING (
    tutor_id IN (
      SELECT id FROM public.tutors WHERE profile_id = auth.uid()
    )
  );

-- Update Tutor Policies to ensure they can update their own row
-- (The insert and select policies were created in Phase 2)
DROP POLICY IF EXISTS "Users can update their own tutor record." ON public.tutors;
CREATE POLICY "Users can update their own tutor record."
  ON public.tutors FOR UPDATE
  USING (profile_id = auth.uid());

-- 6. Setup Storage for Profile Photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tutor-profiles', 'tutor-profiles', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Tutor profiles are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tutor-profiles');

CREATE POLICY "Users can upload their own profile photo."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tutor-profiles' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own profile photo."
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'tutor-profiles' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own profile photo."
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'tutor-profiles' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
