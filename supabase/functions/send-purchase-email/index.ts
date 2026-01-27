import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface PurchaseEmailRequest {
  user_id: string;
  credits_purchased: number;
  amount_paid: number; // in cents
  discount_applied?: number; // in cents
  coupon_code?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // SECURITY: Handle CORS with restricted origins
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  try {
    // SECURITY: Verify this is called from our internal services (service role key)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "")) {
      // Only allow calls from internal services with service role key
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { 
      user_id, 
      credits_purchased, 
      amount_paid,
      discount_applied,
      coupon_code 
    }: PurchaseEmailRequest = await req.json();

    // Fetch user profile
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("email, full_name, credits")
      .eq("id", user_id)
      .single();

    if (userError || !user) {
      throw new Error("Could not find user profile");
    }

    const userName = user.full_name || "there";
    const amountFormatted = (amount_paid / 100).toFixed(2);
    const discountFormatted = discount_applied ? (discount_applied / 100).toFixed(2) : null;
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Build discount section if applicable
    const discountSection = discount_applied && coupon_code ? `
      <tr>
        <td style="padding: 8px 0; color: #666;">Coupon Applied (${coupon_code})</td>
        <td style="padding: 8px 0; color: #10b981; text-align: right;">-$${discountFormatted}</td>
      </tr>
    ` : '';

    // Send confirmation email
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EvolvXTalent <onboarding@resend.dev>",
        to: [user.email],
        subject: `✅ Payment Confirmed - ${credits_purchased} Credits Added!`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fafafa;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 28px;">✓</span>
                </div>
                <h1 style="color: #1a1a2e; margin: 0; font-size: 24px; font-weight: 600;">Payment Successful!</h1>
                <p style="color: #666; margin: 8px 0 0 0; font-size: 14px;">${currentDate}</p>
              </div>
              
              <!-- Greeting -->
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Hi ${userName},
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Thank you for your purchase! Your credits have been added to your account and are ready to use.
              </p>
              
              <!-- Credits Added Box -->
              <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Credits Added</p>
                <p style="color: white; font-size: 42px; font-weight: bold; margin: 0;">+${credits_purchased}</p>
              </div>
              
              <!-- Order Summary -->
              <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="color: #1a1a2e; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Credits Purchased</td>
                    <td style="padding: 8px 0; color: #333; text-align: right; font-weight: 500;">${credits_purchased} credits</td>
                  </tr>
                  ${discountSection}
                  <tr style="border-top: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0 8px 0; color: #333; font-weight: 600;">Total Paid</td>
                    <td style="padding: 12px 0 8px 0; color: #333; text-align: right; font-weight: 600; font-size: 18px;">$${amountFormatted}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Current Balance -->
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; text-align: center; margin: 24px 0;">
                <p style="color: #166534; font-size: 14px; margin: 0;">Your Current Balance</p>
                <p style="color: #166534; font-size: 28px; font-weight: bold; margin: 4px 0 0 0;">${user.credits} Credits</p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://resume-genius1.lovable.app/optimize" 
                   style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Start Optimizing
                </a>
              </div>
              
              <!-- Footer -->
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #888; font-size: 13px; margin: 0;">
                  Questions? Reply to this email or contact our support team.
                </p>
                <p style="color: #aaa; font-size: 12px; margin: 12px 0 0 0;">
                  © ${new Date().getFullYear()} EvolvXTalent. All rights reserved.
                </p>
              </div>
              
            </div>
          </div>
        `,
      }),
    });

    const result = await emailResponse.json();
    console.log("Purchase confirmation email sent:", result);

    if (!emailResponse.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(result)}`);
    }

    return new Response(
      JSON.stringify({ success: true, email_result: result }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-purchase-email function:", errorMessage);
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
