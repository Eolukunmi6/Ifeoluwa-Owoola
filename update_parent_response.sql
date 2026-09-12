ALTER TABLE bookings ADD COLUMN IF NOT EXISTS parent_response text DEFAULT 'pending' CHECK (parent_response IN ('pending', 'satisfied', 'not_satisfied'));
UPDATE bookings SET parent_response = 'satisfied' WHERE parent_marked_satisfied = true;
