import { supabase } from "@/integrations/supabase/client";

export interface JobResult {
  title: string;
  company: string;
  location: string;
  salary: string | null;
  source: string;
  applyUrl: string;
  matchScore: number;
  postedDate: string;
  highlights: string[];
  description: string;
}

export interface JobSearchResponse {
  jobs: JobResult[];
  totalFound: number;
  searchId: string | null;
  sourcesSearched: string[];
}

export interface JobSearchRequest {
  targetRole: string;
  location: string;
  skills?: string;
  resumeId?: string;
}

export async function searchJobs(request: JobSearchRequest): Promise<JobSearchResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("You must be logged in to search for jobs");
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-jobs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(request),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to search for jobs");
  }

  return data;
}

export interface JobSearchHistory {
  id: string;
  search_query: string;
  location: string | null;
  job_results: JobResult[];
  sources_searched: string[] | null;
  created_at: string;
  resume_id: string | null;
}

export async function getJobSearchHistory(): Promise<JobSearchHistory[]> {
  const { data, error } = await supabase
    .from("job_searches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  // Type assertion since the table is new and not in types yet
  return (data || []) as unknown as JobSearchHistory[];
}

export async function getJobSearchById(id: string): Promise<JobSearchHistory | null> {
  const { data, error } = await supabase
    .from("job_searches")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(error.message);
  }

  return data as unknown as JobSearchHistory;
}

export async function deleteJobSearch(id: string): Promise<void> {
  const { error } = await supabase
    .from("job_searches")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
