-- Create children table
CREATE TABLE IF NOT EXISTS public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  age integer not null,
  created_at timestamptz default now()
);

-- Enable RLS for children
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Policies for children
DROP POLICY IF EXISTS "Parents can view their own children" ON public.children;
CREATE POLICY "Parents can view their own children"
  ON public.children FOR SELECT
  USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "Parents can insert their own children" ON public.children;
CREATE POLICY "Parents can insert their own children"
  ON public.children FOR INSERT
  WITH CHECK (parent_id = auth.uid());

DROP POLICY IF EXISTS "Parents can update their own children" ON public.children;
CREATE POLICY "Parents can update their own children"
  ON public.children FOR UPDATE
  USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "Parents can delete their own children" ON public.children;
CREATE POLICY "Parents can delete their own children"
  ON public.children FOR DELETE
  USING (parent_id = auth.uid());


-- Create saved_tutors table
CREATE TABLE IF NOT EXISTS public.saved_tutors (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.profiles(id) on delete cascade,
  tutor_id uuid references public.tutors(id) on delete cascade,
  created_at timestamptz default now(),
  UNIQUE(parent_id, tutor_id)
);

-- Enable RLS for saved_tutors
ALTER TABLE public.saved_tutors ENABLE ROW LEVEL SECURITY;

-- Policies for saved_tutors
DROP POLICY IF EXISTS "Parents can view their own saved tutors" ON public.saved_tutors;
CREATE POLICY "Parents can view their own saved tutors"
  ON public.saved_tutors FOR SELECT
  USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "Parents can insert their own saved tutors" ON public.saved_tutors;
CREATE POLICY "Parents can insert their own saved tutors"
  ON public.saved_tutors FOR INSERT
  WITH CHECK (parent_id = auth.uid());

DROP POLICY IF EXISTS "Parents can delete their own saved tutors" ON public.saved_tutors;
CREATE POLICY "Parents can delete their own saved tutors"
  ON public.saved_tutors FOR DELETE
  USING (parent_id = auth.uid());
