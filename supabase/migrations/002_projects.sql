-- Migration: 002_projects
-- Creates the projects table for AI-generated web application projects

CREATE TABLE IF NOT EXISTS public.projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name        text NOT NULL,
  slug        text,
  description text,
  framework   text NOT NULL DEFAULT 'react-vite',
  files       jsonb NOT NULL DEFAULT '[]'::jsonb,
  messages    jsonb NOT NULL DEFAULT '[]'::jsonb,
  preview_url text,
  is_public   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.projects IS 'AI-generated web application projects belonging to a user.';

-- Index for fast lookup by owner
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects (slug);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own projects, or public projects
CREATE POLICY projects_select_own ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

-- Policy: users can create projects under their own id
CREATE POLICY projects_insert_own ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can update their own projects
CREATE POLICY projects_update_own ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can delete their own projects
CREATE POLICY projects_delete_own ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);
