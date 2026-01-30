import { supabase } from "@/integrations/supabase/client";
import type { JobResult } from "./jobs";

export interface BookmarkedJob {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  location: string;
  salary: string | null;
  source: string;
  apply_url: string;
  match_score: number | null;
  posted_date: string | null;
  highlights: string[] | null;
  description: string | null;
  notes: string | null;
  created_at: string;
}

export async function bookmarkJob(job: JobResult): Promise<BookmarkedJob> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("You must be logged in to bookmark jobs");
  }

  const { data, error } = await supabase
    .from("bookmarked_jobs")
    .insert({
      user_id: user.id,
      job_title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      source: job.source,
      apply_url: job.applyUrl,
      match_score: job.matchScore,
      posted_date: job.postedDate,
      highlights: job.highlights,
      description: job.description,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Job already bookmarked");
    }
    throw new Error(error.message);
  }

  return data as unknown as BookmarkedJob;
}

export async function removeBookmark(applyUrl: string): Promise<void> {
  const { error } = await supabase
    .from("bookmarked_jobs")
    .delete()
    .eq("apply_url", applyUrl);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getBookmarkedJobs(): Promise<BookmarkedJob[]> {
  const { data, error } = await supabase
    .from("bookmarked_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as unknown as BookmarkedJob[];
}

export async function isJobBookmarked(applyUrl: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data, error } = await supabase
    .from("bookmarked_jobs")
    .select("id")
    .eq("apply_url", applyUrl)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error checking bookmark:", error);
    return false;
  }

  return !!data;
}

export async function getBookmarkedUrls(): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return new Set();

  const { data, error } = await supabase
    .from("bookmarked_jobs")
    .select("apply_url")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching bookmarked URLs:", error);
    return new Set();
  }

  return new Set((data || []).map((b: { apply_url: string }) => b.apply_url));
}

export async function updateBookmarkNotes(id: string, notes: string): Promise<void> {
  const { error } = await supabase
    .from("bookmarked_jobs")
    .update({ notes })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
