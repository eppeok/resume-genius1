import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface JobSearchRequest {
  targetRole: string;
  location: string;
  skills?: string;
  resumeId?: string;
}

interface JobResult {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!firecrawlApiKey) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Job search service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from auth header
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { targetRole, location, skills, resumeId }: JobSearchRequest = await req.json();

    // Validate inputs
    if (!targetRole || targetRole.length > 200) {
      return new Response(
        JSON.stringify({ error: "Invalid target role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!location || location.length > 200) {
      return new Response(
        JSON.stringify({ error: "Invalid location" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deduct 2 credits using the new function
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: creditDeducted, error: creditError } = await serviceClient.rpc(
      "deduct_job_search_credits",
      { p_user_id: user.id }
    );

    if (creditError || !creditDeducted) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits. You need at least 2 credits for job search." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Credits deducted for user:", user.id);

    try {
      // Build search query for Google Jobs
      const searchQuery = `${targetRole} jobs in ${location}`;
      console.log("Searching for:", searchQuery);

      // Use Firecrawl search to find jobs via Google Jobs
      const firecrawlResponse = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 15,
          scrapeOptions: {
            formats: ["markdown"],
          },
        }),
      });

      if (!firecrawlResponse.ok) {
        const errorText = await firecrawlResponse.text();
        console.error("Firecrawl error:", errorText);
        throw new Error("Failed to search for jobs");
      }

      const firecrawlData = await firecrawlResponse.json();
      console.log("Firecrawl results count:", firecrawlData.data?.length || 0);

      // Use AI to parse and structure the job results
      const aiPrompt = `You are a job listing parser. Analyze the following search results and extract job listings.
For each job found, extract:
- title: Job title
- company: Company name
- location: Job location
- salary: Salary if mentioned, otherwise null
- source: Source website (LinkedIn, Indeed, Naukri, Glassdoor, etc.)
- applyUrl: URL to apply (use the source URL)
- postedDate: When posted (e.g., "2 days ago", "1 week ago")
- description: Brief job description (1-2 sentences)

Also calculate a matchScore (0-100) based on how well the job matches the target role "${targetRole}" and location "${location}".
${skills ? `Consider these skills for matching: ${skills}` : ""}

For each job, provide 2-3 highlights explaining why it's a good match.

Search Results:
${JSON.stringify(firecrawlData.data?.slice(0, 10) || [], null, 2)}

Respond with a JSON object containing:
{
  "jobs": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "salary": "string or null",
      "source": "string",
      "applyUrl": "string",
      "matchScore": number,
      "postedDate": "string",
      "highlights": ["string", "string"],
      "description": "string"
    }
  ],
  "totalFound": number
}

If no jobs are found, return { "jobs": [], "totalFound": 0 }.
Return ONLY valid JSON, no markdown formatting.`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a job listing parser that extracts structured data from search results. Always respond with valid JSON only." },
            { role: "user", content: aiPrompt },
          ],
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          throw new Error("AI rate limit exceeded, please try again later");
        }
        if (aiResponse.status === 402) {
          throw new Error("AI service quota exceeded");
        }
        const errorText = await aiResponse.text();
        console.error("AI error:", errorText);
        throw new Error("Failed to process job results");
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.choices?.[0]?.message?.content || "";
      
      console.log("AI response:", aiContent.substring(0, 500));

      // Parse AI response
      let jobResults: { jobs: JobResult[]; totalFound: number };
      try {
        // Remove any markdown code blocks if present
        const jsonContent = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        jobResults = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        jobResults = { jobs: [], totalFound: 0 };
      }

      // Validate and sanitize URLs
      const sanitizedJobs = jobResults.jobs.map((job: JobResult) => ({
        ...job,
        applyUrl: job.applyUrl && job.applyUrl.startsWith("http") ? job.applyUrl : "",
        matchScore: Math.min(100, Math.max(0, job.matchScore || 0)),
      }));

      // Sort by match score
      sanitizedJobs.sort((a: JobResult, b: JobResult) => b.matchScore - a.matchScore);

      // Detect sources searched based on location
      const isIndianLocation = location.toLowerCase().includes("india") || 
        location.toLowerCase().includes("bangalore") || 
        location.toLowerCase().includes("mumbai") ||
        location.toLowerCase().includes("delhi") ||
        location.toLowerCase().includes("hyderabad") ||
        location.toLowerCase().includes("chennai") ||
        location.toLowerCase().includes("pune") ||
        location.toLowerCase().includes("kolkata");

      const sourcesList = isIndianLocation 
        ? ["LinkedIn", "Naukri", "Indeed", "Google Jobs"]
        : ["LinkedIn", "Indeed", "Glassdoor", "Google Jobs"];

      // Save job search to database
      const { data: searchRecord, error: insertError } = await serviceClient
        .from("job_searches")
        .insert({
          user_id: user.id,
          resume_id: resumeId || null,
          search_query: targetRole,
          location: location,
          job_results: sanitizedJobs,
          sources_searched: sourcesList,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Failed to save job search:", insertError);
      }

      return new Response(
        JSON.stringify({
          jobs: sanitizedJobs,
          totalFound: sanitizedJobs.length,
          searchId: searchRecord?.id || null,
          sourcesSearched: sourcesList,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (searchError) {
      // Refund credits on failure
      console.error("Search failed, refunding credits:", searchError);
      await serviceClient.rpc("add_credits", { p_user_id: user.id, p_amount: 2 });

      throw searchError;
    }
  } catch (error) {
    console.error("Error in search-jobs:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
