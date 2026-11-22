-- Migration: 004_handle_new_user_trigger
-- Automatically creates a profile row when a user signs up via Supabase Auth

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER          -- runs with table-owner privileges
SET search_path = public  -- prevent search-path injection
AS $$
BEGIN
  INSERT INTO public.profiles (id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (id) DO NOTHING;   -- idempotent: skip if row already exists
  RETURN NEW;
END;
$$;

-- 2. Create the trigger (drop first if re-running)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
