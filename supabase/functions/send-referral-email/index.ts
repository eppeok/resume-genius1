import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReferralEmailRequest {
  referrer_id: string;
  referred_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { referrer_id, referred_id }: ReferralEmailRequest = await req.json();

    // Fetch both users' profile data
    const { data: referrer } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", referrer_id)
      .single();

    const { data: referred } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", referred_id)
      .single();

    if (!referrer || !referred) {
      throw new Error("Could not find user profiles");
    }

    const referrerName = referrer.full_name || "there";
    const referredName = referred.full_name || "Your friend";

    // Send email to referrer using fetch API
    const referrerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ResumeAI <onboarding@resend.dev>",
        to: [referrer.email],
        subject: "🎉 You earned 2 credits from your referral!",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a2e; margin: 0; font-size: 28px;">🎉 Referral Reward!</h1>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hey ${referrerName},
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Great news! <strong>${referredName}</strong> just completed their first resume optimization using your referral link.
            </p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <p style="color: white; font-size: 18px; margin: 0 0 8px 0;">You've earned</p>
              <p style="color: white; font-size: 36px; font-weight: bold; margin: 0;">+2 Credits</p>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Keep sharing your referral link to earn more credits! Each successful referral earns you 2 credits.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://resume-genius1.lovable.app/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                View Your Dashboard
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 40px; text-align: center;">
              Thanks for spreading the word about ResumeAI!
            </p>
          </div>
        `,
      }),
    });

    const referrerResult = await referrerEmailResponse.json();
    console.log("Referrer email sent:", referrerResult);

    // Send email to referred user
    const referredEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ResumeAI <onboarding@resend.dev>",
        to: [referred.email],
        subject: "🎉 You earned 2 bonus credits!",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a2e; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hey ${referredName},
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Congratulations on completing your first resume optimization! Because you signed up with a referral link, you've earned bonus credits.
            </p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <p style="color: white; font-size: 18px; margin: 0 0 8px 0;">Bonus Reward</p>
              <p style="color: white; font-size: 36px; font-weight: bold; margin: 0;">+2 Credits</p>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Now it's your turn! Share your own referral link with friends and earn 2 credits for each one who completes their first optimization.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://resume-genius1.lovable.app/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Get Your Referral Link
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 40px; text-align: center;">
              Thank you for using ResumeAI!
            </p>
          </div>
        `,
      }),
    });

    const referredResult = await referredEmailResponse.json();
    console.log("Referred email sent:", referredResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        referrer_email: referrerResult,
        referred_email: referredResult 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-referral-email function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
