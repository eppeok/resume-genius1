-- Add UPDATE policy for users to update their own job searches
CREATE POLICY "Users can update their own job searches"
ON public.job_searches
FOR UPDATE
USING (auth.uid() = user_id);

-- Add policy to deny anonymous UPDATE access
CREATE POLICY "Deny anonymous update to job_searches"
ON public.job_searches
FOR UPDATE
TO anon
USING (false);