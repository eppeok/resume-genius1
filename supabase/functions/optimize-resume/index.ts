import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResumeRequest {
  fullName: string;
  currentRole: string;
  targetRole: string;
  currentResume: string;
  jobDescription: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, currentRole, targetRole, currentResume, jobDescription } = await req.json() as ResumeRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume optimizer. Your job is to take a candidate's existing resume and optimize it for a specific job description while maintaining truthfulness and professionalism.

Your task:
1. Analyze the job description to identify key skills, keywords, and requirements
2. Restructure and rewrite the resume to highlight relevant experience
3. Incorporate relevant keywords naturally throughout the resume
4. Use action verbs and quantifiable achievements
5. Ensure proper formatting that ATS systems can parse
6. Keep the resume concise (ideally 1-2 pages worth of content)

Output the optimized resume in clean, structured markdown format with the following sections:
- Contact Information (name, professional title)
- Professional Summary (3-4 sentences highlighting key qualifications)
- Skills (bullet list of relevant skills)
- Professional Experience (with achievements and metrics)
- Education
- Additional sections if relevant (certifications, projects, etc.)

Important: Only include truthful information based on what's provided. Do not fabricate experience or skills.`;

    const userPrompt = `Please optimize the following resume for the target role.

**Candidate Name:** ${fullName}
**Current Role:** ${currentRole}
**Target Role:** ${targetRole}

**Job Description:**
${jobDescription}

**Current Resume:**
${currentResume}

Please provide an ATS-optimized version of this resume tailored for the job description above.`;

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
        stream: true,
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
      return new Response(JSON.stringify({ error: "Failed to generate optimized resume" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in optimize-resume:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
