-- policies.sql
-- This script creates the necessary Row Level Security (RLS) policies
-- to allow the application to read and write data.
--
-- WARNING: These are permissive policies suitable for initial development.
-- For a production application, you would want to create more restrictive
-- policies, especially if you were using Supabase's built-in user authentication.

-- 1. Enable RLS on all tables (if not already enabled)
ALTER TABLE public.Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.GameProfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Tasks ENABLE ROW LEVEL SECURITY;

-- 2. Create policies to allow all actions for now.
-- This allows the server (using the anon key) to read and write freely.
-- We will drop any existing policies first to ensure a clean slate.
DROP POLICY IF EXISTS "Enable all actions on Users" ON public.Users;
CREATE POLICY "Enable all actions on Users"
  ON public.Users FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all actions on GameProfiles" ON public.GameProfiles;
CREATE POLICY "Enable all actions on GameProfiles"
  ON public.GameProfiles FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all actions on Tasks" ON public.Tasks;
CREATE POLICY "Enable all actions on Tasks"
  ON public.Tasks FOR ALL
  USING (true)
  WITH CHECK (true);
