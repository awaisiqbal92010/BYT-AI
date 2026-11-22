-- Migration: 003_usage_logs
-- Tracks monthly AI prompt usage per user for billing/quota enforcement

CREATE TABLE IF NOT EXISTS public.usage_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  period        text NOT NULL,  -- format: 'YYYY-MM'
  prompt_count  integer NOT NULL DEFAULT 0,

  CONSTRAINT usage_logs_user_period_unique UNIQUE (user_id, period)
);

COMMENT ON TABLE  public.usage_logs IS 'Monthly prompt usage counters per user.';
COMMENT ON COLUMN public.usage_logs.period IS 'Calendar month in YYYY-MM format, e.g. 2026-08.';

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs (user_id);

-- Enable Row Level Security
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own usage
CREATE POLICY usage_logs_select_own ON public.usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can insert their own usage rows
CREATE POLICY usage_logs_insert_own ON public.usage_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can update their own usage rows (incrementing prompt_count)
CREATE POLICY usage_logs_update_own ON public.usage_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
