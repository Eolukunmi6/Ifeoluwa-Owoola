-- Phase 5 Update: Lesson Packages Structure

-- 1. Add currency to tutors
ALTER TABLE public.tutors
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- 2. Recreate lesson_packages (dropping existing to cleanly apply new structure)
DROP TABLE IF EXISTS public.lesson_packages CASCADE;

CREATE TABLE public.lesson_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE,
  package_type TEXT NOT NULL,
  session_hours INTEGER NOT NULL DEFAULT 0,
  session_minutes INTEGER NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL CHECK (price > 0),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (session_hours >= 0 AND session_minutes >= 0),
  CHECK (session_hours > 0 OR session_minutes > 0),
  UNIQUE(tutor_id, package_type, session_hours, session_minutes)
);

-- 3. Enable RLS and Policies for lesson_packages
ALTER TABLE public.lesson_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lesson packages are viewable by everyone." ON public.lesson_packages;
CREATE POLICY "Lesson packages are viewable by everyone."
  ON public.lesson_packages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Tutors can manage their own lesson packages." ON public.lesson_packages;
CREATE POLICY "Tutors can manage their own lesson packages."
  ON public.lesson_packages FOR ALL
  USING (
    tutor_id IN (
      SELECT id FROM public.tutors WHERE profile_id = auth.uid()
    )
  );
