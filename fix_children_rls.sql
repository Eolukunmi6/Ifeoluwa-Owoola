-- Allow tutors to view children that they have bookings with
DROP POLICY IF EXISTS "Tutors can view booked children" ON public.children;
CREATE POLICY "Tutors can view booked children"
  ON public.children
  FOR SELECT
  USING (
    id IN (
      SELECT child_id FROM public.bookings
      WHERE tutor_id IN (
        SELECT id FROM public.tutors
        WHERE profile_id = auth.uid()
      )
    )
  );

-- Wait, let's also make sure tutors can view profiles of parents they have bookings with just to be safe?
-- In the previous test, 'Profiles visible via JOIN: 2', so they already can. But let's check what policy allows it.
-- Actually, the profiles table might be public read, or have a policy "Users can view all profiles". Yes, profiles is usually public or all authenticated users can read.
