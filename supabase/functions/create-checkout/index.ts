import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Server-side validation: define valid credit packs with fixed pricing
const VALID_PACKS: Record<string, { credits: number; price: number }> = {
  "10-credits": { credits: 10, price: 900 }, // Price in cents
  "25-credits": { credits: 25, price: 1900 },
  "50-credits": { credits: 50, price: 2900 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with service role for coupon validation
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Client for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    // Service client for coupon operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Verify the user's JWT token
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const userEmail = user.email;

    if (!userId || !userEmail) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate pack_id and optional coupon_code from request body
    const { pack_id, coupon_code } = await req.json();

    if (!pack_id || typeof pack_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid pack_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pack = VALID_PACKS[pack_id];
    if (!pack) {
      return new Response(JSON.stringify({ error: "Invalid credit pack selected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let { credits, price } = pack;
    let couponId: string | null = null;
    let discountAmount = 0;

    // Validate coupon if provided
    if (coupon_code && typeof coupon_code === "string") {
      const { data: couponData, error: couponError } = await supabaseAdmin.rpc("validate_coupon", {
        p_code: coupon_code,
        p_user_id: userId,
        p_purchase_amount: price,
      });

      if (couponError) {
        console.error("Coupon validation error:", couponError);
        return new Response(JSON.stringify({ error: "Failed to validate coupon" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = couponData?.[0];
      if (!result?.is_valid) {
        return new Response(JSON.stringify({ error: result?.error_message || "Invalid coupon" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      couponId = result.coupon_id;
      
      // Calculate discount
      if (result.discount_type === "percentage") {
        discountAmount = Math.round(price * (result.discount_value / 100));
      } else {
        discountAmount = Math.min(result.discount_value, price);
      }
      
      price = price - discountAmount;
      
      // Ensure price doesn't go below 50 cents (Stripe minimum)
      if (price < 50) {
        price = 50;
        discountAmount = pack.price - 50;
      }
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe is not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { user_id: userId },
      });
      customerId = customer.id;
    }

    // SECURITY: Validate origin against allowlist
    const ALLOWED_ORIGINS = [
      "https://resume-genius1.lovable.app",
      "https://id-preview--b35e338f-bffc-44f3-9115-efb92e2a0458.lovable.app",
      "http://localhost:5173",
      "http://localhost:4173",
      "http://localhost:8080",
    ];
    
    const requestOrigin = req.headers.get("origin");
    let origin: string;
    
    if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
      origin = requestOrigin;
    } else {
      if (requestOrigin) {
        console.warn(`Rejected untrusted origin: ${requestOrigin}`);
      }
      origin = "https://resume-genius1.lovable.app";
    }

    // Build product description
    let productDescription = `${credits} credits for ATS resume optimization`;
    if (discountAmount > 0) {
      productDescription += ` (Coupon: -$${(discountAmount / 100).toFixed(2)})`;
    }

    // Create checkout session with server-validated pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${credits} Resume Optimization Credits`,
              description: productDescription,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/credits?success=true`,
      cancel_url: `${origin}/credits?canceled=true`,
      metadata: {
        user_id: userId,
        credits: credits.toString(),
        pack_id: pack_id,
        coupon_id: couponId || "",
        discount_amount: discountAmount.toString(),
      },
    });

    // Note: Coupon usage will be incremented when payment succeeds via webhook
    // This prevents incrementing on abandoned checkouts

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in create-checkout:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
