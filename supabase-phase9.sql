-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.profiles(id) on delete cascade,
  child_id uuid references public.children(id) on delete cascade,
  tutor_id uuid references public.tutors(id) on delete cascade,
  lesson_package_id uuid references public.lesson_packages(id) on delete cascade,
  scheduled_at timestamptz not null,
  amount numeric not null,
  currency text not null,
  status text not null check (status in ('pending_payment', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz default now()
);

-- Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies for bookings
-- Parents can view their own bookings
DROP POLICY IF EXISTS "Parents can view their own bookings" ON public.bookings;
CREATE POLICY "Parents can view their own bookings"
  ON public.bookings FOR SELECT
  USING (parent_id = auth.uid());

-- Parents can insert their own bookings
DROP POLICY IF EXISTS "Parents can insert their own bookings" ON public.bookings;
CREATE POLICY "Parents can insert their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (parent_id = auth.uid());

-- Parents can update their own bookings (e.g. cancel)
DROP POLICY IF EXISTS "Parents can update their own bookings" ON public.bookings;
CREATE POLICY "Parents can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (parent_id = auth.uid());

-- Tutors can view bookings for themselves
DROP POLICY IF EXISTS "Tutors can view their own bookings" ON public.bookings;
CREATE POLICY "Tutors can view their own bookings"
  ON public.bookings FOR SELECT
  USING (tutor_id IN (SELECT id FROM public.tutors WHERE profile_id = auth.uid()));

