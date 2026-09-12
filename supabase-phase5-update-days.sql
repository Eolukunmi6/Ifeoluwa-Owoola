-- Phase 5 Update: Add days_per_week to Lesson Packages

-- 1. Add the column to the lesson_packages table
ALTER TABLE public.lesson_packages
ADD COLUMN IF NOT EXISTS days_per_week INTEGER;

-- 2. Add constraint to ensure days_per_week is valid when provided
ALTER TABLE public.lesson_packages
DROP CONSTRAINT IF EXISTS valid_days_per_week;

ALTER TABLE public.lesson_packages
ADD CONSTRAINT valid_days_per_week CHECK (days_per_week IS NULL OR (days_per_week >= 1 AND days_per_week <= 7));
