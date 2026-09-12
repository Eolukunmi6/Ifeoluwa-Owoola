-- Run this in the Supabase SQL Editor to create the required tables for Phase 2

-- 1. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('tutor', 'parent', 'admin')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT,
  state TEXT,
  city TEXT,
  profile_photo TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create parents table
CREATE TABLE public.parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 3. Create tutors table
CREATE TABLE public.tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 4. Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Parents Policies
CREATE POLICY "Parents are viewable by everyone."
  ON public.parents FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own parent record."
  ON public.parents FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE id = profile_id AND role = 'parent')
  );

-- Tutors Policies
CREATE POLICY "Tutors are viewable by everyone."
  ON public.tutors FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own tutor record."
  ON public.tutors FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE id = profile_id AND role = 'tutor')
  );
