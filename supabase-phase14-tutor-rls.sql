-- Ensure Tutors can view their own payments in the database
-- This policy allows tutors to read their own payments from the 'payments' table,
-- enabling accurate net amounts in the dashboard.

DROP POLICY IF EXISTS "Tutors can view their own payments" ON public.payments;
CREATE POLICY "Tutors can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (
    booking_id IN (
      SELECT id FROM public.bookings 
      WHERE tutor_id IN (
        SELECT id FROM public.tutors 
        WHERE profile_id = auth.uid()
      )
    )
  );
