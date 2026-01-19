import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ATSRequest {
  resume: string;
  jobDescription: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { resume, jobDescription } = await req.json() as ATSRequest;
    
    // SECURITY: Input validation
    const MAX_RESUME_LENGTH = 50000; // ~10 pages
    const MAX_JOB_DESC_LENGTH = 10000;

    if (!resume || typeof resume !== 'string' || resume.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Resume is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (resume.length > MAX_RESUME_LENGTH) {
      return new Response(
        JSON.stringify({ error: "Resume exceeds maximum length of 50KB" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Job description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (jobDescription.length > MAX_JOB_DESC_LENGTH) {
      return new Response(
        JSON.stringify({ error: "Job description exceeds maximum length of 10KB" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer. Your job is to analyze a resume against a job description and provide detailed scoring.

You must respond with ONLY valid JSON in this exact format:
{
  "overallScore": <number 0-100>,
  "keywordMatch": <number 0-100>,
  "formatting": <number 0-100>,
  "sections": <number 0-100>,
  "readability": <number 0-100>,
  "suggestions": [<string>, <string>, <string>]
}

Scoring criteria:
1. keywordMatch (40% weight): How well the resume includes keywords from the job description
2. formatting (20% weight): ATS-friendly formatting (no tables, graphics, clean structure)
3. sections (25% weight): Presence of key sections (contact, summary, experience, skills, education)
4. readability (15% weight): Clear language, action verbs, quantifiable achievements

Overall score is the weighted average.
Provide 3 actionable improvement suggestions.`;

    const userPrompt = `Analyze this resume against the job description and provide ATS scores.

**Job Description:**
${jobDescription}

**Resume:**
${resume}

Respond with JSON only.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to analyze resume" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let scores;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      scores = JSON.parse(jsonMatch[1].trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return default scores if parsing fails
      scores = {
        overallScore: 50,
        keywordMatch: 50,
        formatting: 60,
        sections: 50,
        readability: 55,
        suggestions: [
          "Add more relevant keywords from the job description",
          "Include quantifiable achievements in your experience section",
          "Ensure all key sections are present and complete"
        ],
      };
    }

    return new Response(JSON.stringify(scores), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-ats:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
