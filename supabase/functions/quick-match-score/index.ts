import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limit: 10 requests per hour per user
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// In-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
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

    // Verify user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. You can analyze up to 10 resumes per hour for free.",
          rateLimited: true 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { resume, jobDescription } = await req.json();

    // Validate input
    if (!resume || typeof resume !== "string" || resume.length < 100) {
      return new Response(
        JSON.stringify({ error: "Resume must be at least 100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.length < 50) {
      return new Response(
        JSON.stringify({ error: "Job description must be at least 50 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Truncate inputs to prevent abuse (max 10k chars each)
    const truncatedResume = resume.slice(0, 10000);
    const truncatedJobDescription = jobDescription.slice(0, 5000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use a fast model with a focused prompt for quick matching
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an ATS (Applicant Tracking System) keyword matching expert. Your job is to quickly assess how well a resume matches a job description based on keyword alignment.

Analyze the resume and job description, then respond with a JSON object containing:
- score: A number from 0-100 representing keyword match percentage
- assessment: One of "Poor", "Fair", "Good", or "Excellent"
- topMissingKeywords: An array of up to 3 important keywords/skills from the job description that are missing from the resume

Scoring guide:
- 0-39: Poor - Major keyword gaps, unlikely to pass ATS
- 40-59: Fair - Some relevant keywords, but significant gaps
- 60-79: Good - Solid keyword coverage, likely to pass basic ATS
- 80-100: Excellent - Strong keyword alignment

Focus on: technical skills, tools, certifications, industry terms, and job-specific requirements.

Respond ONLY with valid JSON, no additional text.`
          },
          {
            role: "user",
            content: `RESUME:\n${truncatedResume}\n\n---\n\nJOB DESCRIPTION:\n${truncatedJobDescription}`
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI service rate limited. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to analyze resume");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse AI response - handle potential JSON parsing issues
    let result;
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();
      result = JSON.parse(cleanedContent);
    } catch {
      console.error("Failed to parse AI response:", content);
      // Return a default response if parsing fails
      result = {
        score: 50,
        assessment: "Fair",
        topMissingKeywords: []
      };
    }

    // Validate and sanitize the response
    const score = Math.min(100, Math.max(0, Number(result.score) || 50));
    const validAssessments = ["Poor", "Fair", "Good", "Excellent"];
    const assessment = validAssessments.includes(result.assessment) ? result.assessment : 
      score < 40 ? "Poor" : score < 60 ? "Fair" : score < 80 ? "Good" : "Excellent";
    const topMissingKeywords = Array.isArray(result.topMissingKeywords) 
      ? result.topMissingKeywords.slice(0, 3).map((k: unknown) => String(k))
      : [];

    return new Response(
      JSON.stringify({ score, assessment, topMissingKeywords }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("quick-match-score error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
