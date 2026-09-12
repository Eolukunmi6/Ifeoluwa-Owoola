-- Bookings
DROP POLICY IF EXISTS "Tutors can view their own bookings" ON public.bookings;
CREATE POLICY "Tutors can view their own bookings"
  ON public.bookings FOR SELECT
  USING (tutor_id IN (SELECT id FROM public.tutors WHERE profile_id = auth.uid()));

-- Payments
DROP POLICY IF EXISTS "Tutors can view their own payments" ON public.payments;
CREATE POLICY "Tutors can view their own payments"
  ON public.payments FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM public.bookings 
      WHERE tutor_id IN (SELECT id FROM public.tutors WHERE profile_id = auth.uid())
    )
  );

-- Earnings bypasses RLS (server-side), but Wallet might use client-side! Wait, let's check Wallet and Earnings endpoints.
