-- Phase 5 Database Updates

-- 1. Create lesson_packages table
CREATE TABLE IF NOT EXISTS public.lesson_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  price NUMERIC NOT NULL CHECK (price > 0),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tutor_id, duration_minutes)
);

-- 2. Create tutor_availability table
CREATE TABLE IF NOT EXISTS public.tutor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CHECK (end_time > start_time)
);

-- 3. Enable RLS
ALTER TABLE public.lesson_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for lesson_packages
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

-- 5. RLS Policies for tutor_availability
DROP POLICY IF EXISTS "Tutor availability is viewable by everyone." ON public.tutor_availability;
CREATE POLICY "Tutor availability is viewable by everyone."
  ON public.tutor_availability FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Tutors can manage their own availability." ON public.tutor_availability;
CREATE POLICY "Tutors can manage their own availability."
  ON public.tutor_availability FOR ALL
  USING (
    tutor_id IN (
      SELECT id FROM public.tutors WHERE profile_id = auth.uid()
    )
  );
