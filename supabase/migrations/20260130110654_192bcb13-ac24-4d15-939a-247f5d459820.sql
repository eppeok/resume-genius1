-- Deny anonymous access to profiles table
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles FOR SELECT
TO anon
USING (false);

-- Deny anonymous INSERT to profiles
CREATE POLICY "Deny anonymous insert to profiles"
ON public.profiles FOR INSERT
TO anon
WITH CHECK (false);

-- Deny anonymous UPDATE to profiles
CREATE POLICY "Deny anonymous update to profiles"
ON public.profiles FOR UPDATE
TO anon
USING (false);

-- Deny anonymous DELETE to profiles (already blocked, but explicit is better)
CREATE POLICY "Deny anonymous delete to profiles"
ON public.profiles FOR DELETE
TO anon
USING (false);