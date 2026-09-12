-- Phase 14: Manual Admin Payment Confirmation

-- Add columns to payments table for manual overrides
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES public.profiles(id);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS confirmed_at timestamp with time zone;

-- Update RLS policies just in case, using DROP POLICY IF EXISTS before CREATE POLICY
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments" ON public.payments
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
