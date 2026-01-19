import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// SECURITY: Define valid credit packs server-side to prevent manipulation
const VALID_PACKS: Record<string, { credits: number; price: number }> = {
  "10-credits": { credits: 10, price: 900 },
  "25-credits": { credits: 25, price: 1900 },
  "50-credits": { credits: 50, price: 2900 },
};

serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!stripeKey) {
    console.error("STRIPE_SECRET_KEY not configured");
    return new Response("Stripe not configured", { status: 500 });
  }

  // SECURITY: Always require webhook secret in production
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured - webhook verification required");
    return new Response("Webhook secret required", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  // SECURITY: Always require signature
  if (!signature) {
    console.error("Missing stripe-signature header");
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${err instanceof Error ? err.message : "Unknown"}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const userId = session.metadata?.user_id;
    const credits = parseInt(session.metadata?.credits || "0", 10);
    const packId = session.metadata?.pack_id;
    const amountTotal = session.amount_total || 0;

    // SECURITY: Validate all required metadata fields
    if (!userId || !credits || credits <= 0 || !amountTotal || amountTotal <= 0) {
      console.error("Invalid session metadata:", session.metadata);
      return new Response("Invalid metadata", { status: 400 });
    }

    // SECURITY: Validate pack exists and pricing matches expected values
    if (!packId || !VALID_PACKS[packId]) {
      console.error("Invalid or missing pack_id:", packId);
      return new Response("Invalid pack", { status: 400 });
    }

    const expectedPack = VALID_PACKS[packId];
    if (expectedPack.credits !== credits || expectedPack.price !== amountTotal) {
      console.error("Price/credit mismatch:", { 
        packId, 
        expected: expectedPack, 
        actual: { credits, amountTotal } 
      });
      return new Response("Invalid payment amount", { status: 400 });
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // SECURITY: Check for duplicate session to prevent replay attacks
    const { data: existingTransaction } = await supabase
      .from("credit_transactions")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (existingTransaction) {
      console.log("Duplicate webhook received for session:", session.id);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Add credits to user
    const { error: updateError } = await supabase.rpc("add_credits", {
      p_user_id: userId,
      p_amount: credits,
    });

    if (updateError) {
      console.error("Failed to add credits:", updateError);
      return new Response("Failed to add credits", { status: 500 });
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        amount: credits,
        price_paid: amountTotal,
        stripe_session_id: session.id,
        description: `Purchased ${credits} credits`,
      });

    if (transactionError) {
      console.error("Failed to record transaction:", transactionError);
      // Don't fail the webhook for this - credits already added
    }

    console.log(`Added ${credits} credits to user ${userId}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
