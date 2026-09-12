ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS parent_issue_reported BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_issue_details TEXT;
