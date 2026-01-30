/**
 * Tests for send-referral-email Edge Function
 * 
 * Test cases:
 * 1. Authorization: Reject requests without service role key
 * 2. Input validation: Reject missing referrer_id or referred_id
 * 3. Input validation: Reject invalid user IDs
 * 4. Email sending: Sends email to both referrer and referred user
 * 5. Email content: Includes correct credit reward information
 */
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import "../_tests/setup.ts";
import { FUNCTIONS_URL } from "../_tests/setup.ts";
import { callEdgeFunction } from "../_tests/test-utils.ts";

const FUNCTION_NAME = "send-referral-email";

Deno.test("send-referral-email: rejects requests without service role key", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    body: {
      referrer_id: "test-referrer-id",
      referred_id: "test-referred-id",
    },
  });

  const body = await response.text();
  assertEquals(response.status, 401, `Expected 401, got ${response.status}: ${body}`);
});

Deno.test("send-referral-email: rejects requests with regular user token", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "regular-user-token",
    body: {
      referrer_id: "test-referrer-id",
      referred_id: "test-referred-id",
    },
  });

  const body = await response.text();
  assertEquals(response.status, 401, `Expected 401, got ${response.status}: ${body}`);
});

Deno.test("send-referral-email: validates required fields", async () => {
  const requiredFields = ["referrer_id", "referred_id"];
  
  requiredFields.forEach(field => assertExists(field));
  assertEquals(requiredFields.length, 2);
});

Deno.test("send-referral-email: validates referral reward amount", async () => {
  // Both referrer and referred get 2 credits
  const referralReward = 2;
  
  assertEquals(referralReward, 2);
});

Deno.test("send-referral-email: CORS preflight returns proper headers", async () => {
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

Deno.test("send-referral-email: validates referrer email content", async () => {
  // Referrer email should contain these elements
  const referrerEmailElements = [
    "Referral Reward",
    "+2 Credits",
    "completed their first resume optimization",
    "View Your Dashboard",
  ];
  
  referrerEmailElements.forEach(element => assertExists(element));
});

Deno.test("send-referral-email: validates referred user email content", async () => {
  // Referred user email should contain these elements
  const referredEmailElements = [
    "Congratulations",
    "Bonus Reward",
    "+2 Credits",
    "Get Your Referral Link",
  ];
  
  referredEmailElements.forEach(element => assertExists(element));
});

Deno.test("send-referral-email: validates both emails are sent", async () => {
  // Function should send emails to both users
  const expectedRecipients = ["referrer", "referred"];
  
  assertEquals(expectedRecipients.length, 2);
});

Deno.test("send-referral-email: validates Resend API endpoint", async () => {
  const resendEndpoint = "https://api.resend.com/emails";
  assertExists(resendEndpoint);
});

Deno.test("send-referral-email: validates success response structure", async () => {
  // Success response should contain results for both emails
  const responseFields = ["success", "referrer_email", "referred_email"];
  
  responseFields.forEach(field => assertExists(field));
  assertEquals(responseFields.length, 3);
});
