-- Ensure public read access to all marketplace tables

-- Tutors table
DROP POLICY IF EXISTS "Public can view tutors" ON public.tutors;
CREATE POLICY "Public can view tutors" ON public.tutors FOR SELECT USING (true);

-- Profiles table
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

-- Tutor subjects
DROP POLICY IF EXISTS "Public can view tutor_subjects" ON public.tutor_subjects;
CREATE POLICY "Public can view tutor_subjects" ON public.tutor_subjects FOR SELECT USING (true);

-- Lesson packages
DROP POLICY IF EXISTS "Public can view lesson_packages" ON public.lesson_packages;
CREATE POLICY "Public can view lesson_packages" ON public.lesson_packages FOR SELECT USING (true);

-- Subjects
DROP POLICY IF EXISTS "Public can view subjects" ON public.subjects;
CREATE POLICY "Public can view subjects" ON public.subjects FOR SELECT USING (true);

-- Examinations (in case it is created later)
DROP POLICY IF EXISTS "Public can view examinations" ON public.examinations;
CREATE POLICY "Public can view examinations" ON public.examinations FOR SELECT USING (true);
