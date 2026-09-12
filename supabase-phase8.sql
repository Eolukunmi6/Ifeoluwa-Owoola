-- Create countries table
CREATE TABLE IF NOT EXISTS public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS for countries
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Countries are viewable by everyone" ON public.countries;
CREATE POLICY "Countries are viewable by everyone" ON public.countries FOR SELECT USING (true);

-- Create examinations table
CREATE TABLE IF NOT EXISTS public.examinations (
  id uuid primary key default gen_random_uuid(),
  country_id uuid references public.countries(id) on delete cascade,
  name text not null,
  active boolean default true,
  created_at timestamptz default now(),
  UNIQUE(country_id, name)
);

-- Enable RLS for examinations
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Examinations are viewable by everyone" ON public.examinations;
CREATE POLICY "Examinations are viewable by everyone" ON public.examinations FOR SELECT USING (true);

-- Create tutor_examinations table
CREATE TABLE IF NOT EXISTS public.tutor_examinations (
  tutor_id uuid references public.tutors(id) on delete cascade,
  examination_id uuid references public.examinations(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (tutor_id, examination_id)
);

-- Enable RLS for tutor_examinations
ALTER TABLE public.tutor_examinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tutor examinations are viewable by everyone" ON public.tutor_examinations;
CREATE POLICY "Tutor examinations are viewable by everyone" ON public.tutor_examinations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tutors can insert their own examinations" ON public.tutor_examinations;
CREATE POLICY "Tutors can insert their own examinations" ON public.tutor_examinations FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM public.tutors WHERE id = tutor_examinations.tutor_id));

DROP POLICY IF EXISTS "Tutors can delete their own examinations" ON public.tutor_examinations;
CREATE POLICY "Tutors can delete their own examinations" ON public.tutor_examinations FOR DELETE
  USING (auth.uid() IN (SELECT profile_id FROM public.tutors WHERE id = tutor_examinations.tutor_id));

-- Seed Data
INSERT INTO public.countries (name) VALUES 
  ('Nigeria'), ('Ghana'), ('Kenya'), ('South Africa'), ('Uganda')
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  nigeria_id uuid;
  ghana_id uuid;
  kenya_id uuid;
BEGIN
  SELECT id INTO nigeria_id FROM public.countries WHERE name = 'Nigeria';
  
  IF nigeria_id IS NOT NULL THEN
    INSERT INTO public.examinations (country_id, name) VALUES
      (nigeria_id, 'WAEC'),
      (nigeria_id, 'NECO'),
      (nigeria_id, 'JAMB')
    ON CONFLICT (country_id, name) DO NOTHING;
  END IF;
  
  SELECT id INTO ghana_id FROM public.countries WHERE name = 'Ghana';
  
  IF ghana_id IS NOT NULL THEN
    INSERT INTO public.examinations (country_id, name) VALUES
      (ghana_id, 'WASSCE (Ghana)')
    ON CONFLICT (country_id, name) DO NOTHING;
  END IF;
  
  SELECT id INTO kenya_id FROM public.countries WHERE name = 'Kenya';
  
  IF kenya_id IS NOT NULL THEN
    INSERT INTO public.examinations (country_id, name) VALUES
      (kenya_id, 'KCSE')
    ON CONFLICT (country_id, name) DO NOTHING;
  END IF;
END $$;

