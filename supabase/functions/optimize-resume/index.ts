import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    // SECURITY: Verify user has credits before processing (using service role)
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.credits < 1) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY: Deduct credit server-side BEFORE processing
    const { error: deductError } = await adminSupabase.rpc("deduct_credit", { p_user_id: user.id });
    if (deductError) {
      console.error("Failed to deduct credit:", deductError);
      return new Response(
        JSON.stringify({ error: "Failed to process payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this is the user's first optimization (for referral rewards)
    const { count: existingResumes } = await adminSupabase
      .from("resumes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    
    const isFirstOptimization = existingResumes === 0;

    const { fullName, currentRole, targetRole, currentResume, jobDescription } = await req.json() as ResumeRequest;
    
    // SECURITY: Input validation
    const MAX_RESUME_LENGTH = 50000; // ~10 pages
    const MAX_JOB_DESC_LENGTH = 10000;
    const MAX_NAME_LENGTH = 200;
    const MAX_ROLE_LENGTH = 200;

    if (!currentResume || typeof currentResume !== 'string' || currentResume.trim().length === 0) {
      // Refund credit for invalid input
      await adminSupabase.rpc("add_credits", { p_user_id: user.id, p_amount: 1 });
      return new Response(
        JSON.stringify({ error: "Resume is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (currentResume.length > MAX_RESUME_LENGTH) {
      await adminSupabase.rpc("add_credits", { p_user_id: user.id, p_amount: 1 });
      return new Response(
        JSON.stringify({ error: "Resume exceeds maximum length of 50KB" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
      await adminSupabase.rpc("add_credits", { p_user_id: user.id, p_amount: 1 });
      return new Response(
        JSON.stringify({ error: "Job description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (jobDescription.length > MAX_JOB_DESC_LENGTH) {
      await adminSupabase.rpc("add_credits", { p_user_id: user.id, p_amount: 1 });
      return new Response(
        JSON.stringify({ error: "Job description exceeds maximum length of 10KB" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate optional string fields
    if (fullName && (typeof fullName !== 'string' || fullName.length > MAX_NAME_LENGTH)) {
      await adminSupabase.rpc("add_credits", { p_user_id: user.id, p_amount: 1 });
      return new Response(
        JSON.stringify({ error: "Full name exceeds maximum length" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (currentRole && (typeof currentRole !== 'string' || currentRole.length > MAX_ROLE_LENGTH)) {
      await adminSupabase.rpc("add_credits", { p_user_id: user.id, p_amount: 1 });
      return new Response(
        JSON.stringify({ error: "Current role exceeds maximum length" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (targetRole && (typeof targetRole !== 'string' || targetRole.length > MAX_ROLE_LENGTH)) {
      await adminSupabase.rpc("add_credits", { p_user_id: user.id, p_amount: 1 });
      return new Response(
        JSON.stringify({ error: "Target role exceeds maximum length" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Refund the credit if we can't process
      await adminSupabase.rpc("add_credits", { p_user_id: user.id, p_amount: 1 });
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

CRITICAL - Output Format Requirements:
Use this EXACT markdown structure for optimal PDF rendering:

## Professional Summary
Write 3-4 sentences as a cohesive paragraph highlighting key qualifications.

## Skills
List skills separated by commas: Skill 1, Skill 2, Skill 3, Skill 4

## Professional Experience

### Job Title | Company Name | Jan 2020 - Present
- Achievement with quantifiable result (increased X by Y%)
- Another accomplishment with metrics
- Key responsibility or project outcome

### Previous Job Title | Previous Company | Mar 2017 - Dec 2019
- Achievement bullet point
- Another accomplishment

## Education

### Degree Name | University Name | 2016
Field of study or honors if applicable

## Certifications (if applicable)

### Certification Name | Issuing Organization | Year

Important Rules:
- Use ### for job/education entries with pipe separators: ### Title | Organization | Date
- Each bullet point must start with a dash and action verb
- Keep bullets concise (1-2 lines each)
- Include quantifiable metrics where possible
- Only include truthful information from what's provided`;

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
      // Refund the credit if AI call fails
      await adminSupabase.rpc("add_credits", { p_user_id: user.id, p_amount: 1 });
      
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

    // Award referral credits if this is the user's first optimization
    if (isFirstOptimization) {
      try {
        const { data: referralAwarded } = await adminSupabase.rpc("award_referral_credits", { 
          p_referred_id: user.id 
        });
        if (referralAwarded) {
          console.log("Referral credits awarded for user:", user.id);
        }
      } catch (referralError) {
        console.error("Error awarding referral credits:", referralError);
        // Don't fail the request if referral awarding fails
      }
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
