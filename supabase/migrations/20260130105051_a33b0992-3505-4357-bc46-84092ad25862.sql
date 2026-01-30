-- Create bookmarked_jobs table
CREATE TABLE public.bookmarked_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    salary TEXT,
    source TEXT NOT NULL,
    apply_url TEXT NOT NULL,
    match_score INTEGER,
    posted_date TEXT,
    highlights TEXT[],
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT bookmarked_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.bookmarked_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarked_jobs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own bookmarks
CREATE POLICY "Users can create their own bookmarks"
ON public.bookmarked_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookmarks
CREATE POLICY "Users can update their own bookmarks"
ON public.bookmarked_jobs
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarked_jobs
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all bookmarks
CREATE POLICY "Admins can view all bookmarks"
ON public.bookmarked_jobs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_bookmarked_jobs_user_id ON public.bookmarked_jobs(user_id);
CREATE INDEX idx_bookmarked_jobs_apply_url ON public.bookmarked_jobs(user_id, apply_url);