ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS tutor_marked_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tutor_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS parent_marked_satisfied BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_satisfied_at TIMESTAMPTZ;

-- Allow tutors to update their own bookings to mark them as complete
DROP POLICY IF EXISTS "Tutors can update their own bookings" ON public.bookings;
CREATE POLICY "Tutors can update their own bookings"
  ON public.bookings
  FOR UPDATE
  USING (
    tutor_id IN (
      SELECT id FROM public.tutors WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    tutor_id IN (
      SELECT id FROM public.tutors WHERE profile_id = auth.uid()
    )
  );

-- Allow parents to update their own bookings to mark them as satisfied
DROP POLICY IF EXISTS "Parents can update their own bookings" ON public.bookings;
CREATE POLICY "Parents can update their own bookings"
  ON public.bookings
  FOR UPDATE
  USING (
    parent_id = auth.uid()
  )
  WITH CHECK (
    parent_id = auth.uid()
  );
