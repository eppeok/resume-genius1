-- Create job_searches table
CREATE TABLE public.job_searches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    search_query TEXT NOT NULL,
    location TEXT,
    job_results JSONB NOT NULL DEFAULT '[]'::jsonb,
    sources_searched TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.job_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own job searches"
ON public.job_searches
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job searches"
ON public.job_searches
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job searches"
ON public.job_searches
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all job searches"
ON public.job_searches
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_job_searches_user_id ON public.job_searches(user_id);
CREATE INDEX idx_job_searches_created_at ON public.job_searches(created_at DESC);

-- Create function to deduct 2 credits for job search
CREATE OR REPLACE FUNCTION public.deduct_job_search_credits(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    SELECT credits INTO current_credits FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    
    IF current_credits IS NULL OR current_credits < 2 THEN
        RETURN FALSE;
    END IF;
    
    UPDATE public.profiles SET credits = credits - 2 WHERE id = p_user_id;
    RETURN TRUE;
END;
$$;