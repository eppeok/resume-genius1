-- Fix profiles table RLS policies to properly restrict anon access
-- The issue: policies targeting "public" role include anon users

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block anon select on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block anon insert on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block anon update on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block anon delete on profiles" ON public.profiles;

-- Recreate policies targeting ONLY authenticated role (excludes anon)
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix resumes table the same way
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can create their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Admins can view all resumes" ON public.resumes;
DROP POLICY IF EXISTS "Block anon select on resumes" ON public.resumes;
DROP POLICY IF EXISTS "Block anon insert on resumes" ON public.resumes;
DROP POLICY IF EXISTS "Block anon update on resumes" ON public.resumes;
DROP POLICY IF EXISTS "Block anon delete on resumes" ON public.resumes;

-- Recreate policies targeting ONLY authenticated role
CREATE POLICY "Users can view their own resumes"
ON public.resumes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resumes"
ON public.resumes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
ON public.resumes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
ON public.resumes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all resumes"
ON public.resumes FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));