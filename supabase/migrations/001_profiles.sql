-- Migration: 001_profiles
-- Creates the profiles table that extends Supabase auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  github_username text,
  plan        text NOT NULL DEFAULT 'free'
              CHECK (plan IN ('free', 'medium', 'premium', 'legendary')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profile data, one-to-one with auth.users.';

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own profile
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: users can insert their own profile (needed for trigger / edge cases)
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: users can update their own profile
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
