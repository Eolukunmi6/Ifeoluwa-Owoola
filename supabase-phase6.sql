-- Phase 6: RLS for Public Marketplace

-- Make Profiles publicly readable
DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone." 
  ON public.profiles FOR SELECT 
  USING (true);

-- Make Tutors publicly readable
DROP POLICY IF EXISTS "Tutor profiles are viewable by everyone." ON public.tutors;
CREATE POLICY "Tutor profiles are viewable by everyone." 
  ON public.tutors FOR SELECT 
  USING (true);

-- Make Subjects publicly readable
DROP POLICY IF EXISTS "Subjects are viewable by everyone." ON public.subjects;
CREATE POLICY "Subjects are viewable by everyone." 
  ON public.subjects FOR SELECT 
  USING (true);

-- Make Tutor Subjects publicly readable
DROP POLICY IF EXISTS "Tutor subjects are viewable by everyone." ON public.tutor_subjects;
CREATE POLICY "Tutor subjects are viewable by everyone." 
  ON public.tutor_subjects FOR SELECT 
  USING (true);

-- Make Lesson Packages publicly readable
DROP POLICY IF EXISTS "Lesson packages are viewable by everyone." ON public.lesson_packages;
CREATE POLICY "Lesson packages are viewable by everyone." 
  ON public.lesson_packages FOR SELECT 
  USING (true);

-- Make Tutor Availability publicly readable
DROP POLICY IF EXISTS "Tutor availability is viewable by everyone." ON public.tutor_availability;
CREATE POLICY "Tutor availability is viewable by everyone." 
  ON public.tutor_availability FOR SELECT 
  USING (true);

-- Make Tutor Videos publicly readable (fails gracefully if table doesn't exist yet)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'tutor_videos'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Tutor videos are viewable by everyone." ON public.tutor_videos;';
    EXECUTE 'CREATE POLICY "Tutor videos are viewable by everyone." ON public.tutor_videos FOR SELECT USING (true);';
  END IF;
END $$;
