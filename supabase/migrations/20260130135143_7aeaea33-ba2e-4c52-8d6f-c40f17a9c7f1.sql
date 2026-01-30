-- Drop existing anonymous deny policies and recreate with explicit anon role targeting
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous insert to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous update to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous delete to profiles" ON public.profiles;

DROP POLICY IF EXISTS "Deny anonymous access to resumes" ON public.resumes;
DROP POLICY IF EXISTS "Deny anonymous insert to resumes" ON public.resumes;
DROP POLICY IF EXISTS "Deny anonymous update to resumes" ON public.resumes;
DROP POLICY IF EXISTS "Deny anonymous delete to resumes" ON public.resumes;

-- Create restrictive policies that explicitly target the anon role
CREATE POLICY "Block anon select on profiles" ON public.profiles
FOR SELECT TO anon USING (false);

CREATE POLICY "Block anon insert on profiles" ON public.profiles
FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "Block anon update on profiles" ON public.profiles
FOR UPDATE TO anon USING (false);

CREATE POLICY "Block anon delete on profiles" ON public.profiles
FOR DELETE TO anon USING (false);

CREATE POLICY "Block anon select on resumes" ON public.resumes
FOR SELECT TO anon USING (false);

CREATE POLICY "Block anon insert on resumes" ON public.resumes
FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "Block anon update on resumes" ON public.resumes
FOR UPDATE TO anon USING (false);

CREATE POLICY "Block anon delete on resumes" ON public.resumes
FOR DELETE TO anon USING (false);