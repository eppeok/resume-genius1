-- Ensure RLS is enabled on profiles table (this is idempotent - safe to run even if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS to apply to table owner as well (prevents bypassing)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;