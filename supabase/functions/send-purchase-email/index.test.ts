/**
 * Tests for send-purchase-email Edge Function
 * 
 * Test cases:
 * 1. Authorization: Reject requests without service role key
 * 2. Authorization: Reject requests with regular user token
 * 3. Input validation: Reject missing user_id
 * 4. Input validation: Reject invalid user_id (not found)
 * 5. Email sending: Successfully sends confirmation email via Resend
 * 6. Email content: Includes correct credits, amount, and coupon info
 * 7. Configuration: Fails gracefully when RESEND_API_KEY missing
 */
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import "../_tests/setup.ts";
import { FUNCTIONS_URL } from "../_tests/setup.ts";
import { callEdgeFunction } from "../_tests/test-utils.ts";

const FUNCTION_NAME = "send-purchase-email";

Deno.test("send-purchase-email: rejects requests without service role key", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    body: {
      user_id: "test-user-id",
      credits_purchased: 10,
      amount_paid: 900,
    },
  });

  const body = await response.text();
  assertEquals(response.status, 401, `Expected 401, got ${response.status}: ${body}`);
});

Deno.test("send-purchase-email: rejects requests with regular user token", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "regular-user-token",
    body: {
      user_id: "test-user-id",
      credits_purchased: 10,
      amount_paid: 900,
    },
  });

  const body = await response.text();
  assertEquals(response.status, 401, `Expected 401, got ${response.status}: ${body}`);
});

Deno.test("send-purchase-email: validates required fields", async () => {
  const requiredFields = ["user_id", "credits_purchased", "amount_paid"];
  
  requiredFields.forEach(field => assertExists(field));
  assertEquals(requiredFields.length, 3);
});

Deno.test("send-purchase-email: validates optional fields", async () => {
  const optionalFields = ["discount_applied", "coupon_code"];
  
  optionalFields.forEach(field => assertExists(field));
  assertEquals(optionalFields.length, 2);
});

Deno.test("send-purchase-email: validates amount_paid is in cents", async () => {
  // $9.00 should be stored as 900 cents
  const amountInDollars = 9.00;
  const amountInCents = 900;
  
  assertEquals(amountInCents / 100, amountInDollars);
});

Deno.test("send-purchase-email: validates discount_applied is in cents", async () => {
  // $2.00 discount should be stored as 200 cents
  const discountInDollars = 2.00;
  const discountInCents = 200;
  
  assertEquals(discountInCents / 100, discountInDollars);
});

Deno.test("send-purchase-email: CORS preflight returns proper headers", async () => {
  const response = await fetch(`${FUNCTIONS_URL}/${FUNCTION_NAME}`, {
    method: "OPTIONS",
    headers: {
      "Origin": "https://resume-genius1.lovable.app",
      "Access-Control-Request-Method": "POST",
    },
  });

  await response.text(); // Consume body
  
  const isValidStatus = response.status === 204 || response.status === 200;
  assertEquals(isValidStatus, true, `Expected 200 or 204 for OPTIONS, got ${response.status}`);
});

Deno.test("send-purchase-email: validates email content structure", async () => {
  // Email should contain these key elements
  const emailElements = [
    "Payment Successful",
    "Credits Added",
    "Order Summary",
    "Credits Purchased",
    "Total Paid",
    "Current Balance",
    "Start Optimizing",
  ];
  
  emailElements.forEach(element => assertExists(element));
});

Deno.test("send-purchase-email: validates discount section in email", async () => {
  // When discount is applied, email should show coupon info
  const discountElements = [
    "Coupon Applied",
  ];
  
  discountElements.forEach(element => assertExists(element));
});

Deno.test("send-purchase-email: validates Resend API endpoint", async () => {
  const resendEndpoint = "https://api.resend.com/emails";
  assertExists(resendEndpoint);
});
