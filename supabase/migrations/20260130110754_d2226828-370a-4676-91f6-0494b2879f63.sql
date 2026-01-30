-- Deny anonymous access to resumes table
CREATE POLICY "Deny anonymous access to resumes"
ON public.resumes FOR SELECT
TO anon
USING (false);

-- Deny anonymous INSERT to resumes
CREATE POLICY "Deny anonymous insert to resumes"
ON public.resumes FOR INSERT
TO anon
WITH CHECK (false);

-- Deny anonymous UPDATE to resumes
CREATE POLICY "Deny anonymous update to resumes"
ON public.resumes FOR UPDATE
TO anon
USING (false);

-- Deny anonymous DELETE to resumes
CREATE POLICY "Deny anonymous delete to resumes"
ON public.resumes FOR DELETE
TO anon
USING (false);