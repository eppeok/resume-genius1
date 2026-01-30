/**
 * CORS Security Tests
 * 
 * Test cases:
 * 1. Allowed origins receive proper CORS headers
 * 2. Unknown origins fall back to production origin
 * 3. Preflight requests handled correctly
 */
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import "../setup.ts";
import { FUNCTIONS_URL, ALLOWED_ORIGINS, UNKNOWN_ORIGIN } from "../setup.ts";

const FUNCTIONS_TO_TEST = [
  "analyze-ats",
  "optimize-resume",
  "parse-pdf",
  "search-jobs",
  "create-checkout",
  "send-purchase-email",
  "send-referral-email",
];

Deno.test("CORS: allowed origins receive proper headers - analyze-ats", async () => {
  const response = await fetch(`${FUNCTIONS_URL}/analyze-ats`, {
    method: "OPTIONS",
    headers: {
      "Origin": ALLOWED_ORIGINS[0],
      "Access-Control-Request-Method": "POST",
    },
  });

  await response.text();
  
  const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
  assertExists(allowOrigin, "Missing Access-Control-Allow-Origin header");
  
  // Should match the requested origin or be *
  const isValidOrigin = allowOrigin === ALLOWED_ORIGINS[0] || allowOrigin === "*";
  assertEquals(isValidOrigin, true, `Unexpected origin: ${allowOrigin}`);
});

Deno.test("CORS: preflight includes required headers", async () => {
  const response = await fetch(`${FUNCTIONS_URL}/analyze-ats`, {
    method: "OPTIONS",
    headers: {
      "Origin": ALLOWED_ORIGINS[0],
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "authorization, content-type",
    },
  });

  await response.text();
  
  const allowHeaders = response.headers.get("Access-Control-Allow-Headers");
  assertExists(allowHeaders, "Missing Access-Control-Allow-Headers");
  
  // Should include authorization and content-type
  const lowerHeaders = allowHeaders.toLowerCase();
  assertEquals(lowerHeaders.includes("authorization"), true);
  assertEquals(lowerHeaders.includes("content-type"), true);
});

Deno.test("CORS: preflight returns 200 or 204", async () => {
  const response = await fetch(`${FUNCTIONS_URL}/analyze-ats`, {
    method: "OPTIONS",
    headers: {
      "Origin": ALLOWED_ORIGINS[0],
      "Access-Control-Request-Method": "POST",
    },
  });

  await response.text();
  
  const isValidStatus = response.status === 200 || response.status === 204;
  assertEquals(isValidStatus, true, `Expected 200 or 204, got ${response.status}`);
});

Deno.test("CORS: localhost origin accepted for development", async () => {
  const localhostOrigin = "http://localhost:5173";
  
  const response = await fetch(`${FUNCTIONS_URL}/analyze-ats`, {
    method: "OPTIONS",
    headers: {
      "Origin": localhostOrigin,
      "Access-Control-Request-Method": "POST",
    },
  });

  await response.text();
  
  const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
  assertExists(allowOrigin);
  
  // Should accept localhost for development
  const isValidOrigin = allowOrigin === localhostOrigin || allowOrigin === "*";
  assertEquals(isValidOrigin, true, `Localhost should be accepted: ${allowOrigin}`);
});

Deno.test("CORS: unknown origin falls back to production", async () => {
  const response = await fetch(`${FUNCTIONS_URL}/analyze-ats`, {
    method: "OPTIONS",
    headers: {
      "Origin": UNKNOWN_ORIGIN,
      "Access-Control-Request-Method": "POST",
    },
  });

  await response.text();
  
  const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
  assertExists(allowOrigin);
  
  // Should either reject unknown origins or fall back to production origin
  // Based on our implementation, it falls back to production
  const isExpectedOrigin = 
    allowOrigin === "https://resume-genius1.lovable.app" ||
    allowOrigin === "*";
  
  assertEquals(isExpectedOrigin, true, `Unexpected origin for unknown: ${allowOrigin}`);
});

Deno.test("CORS: POST requests include CORS headers", async () => {
  // Make a POST request (will fail auth, but should still have CORS headers)
  const response = await fetch(`${FUNCTIONS_URL}/analyze-ats`, {
    method: "POST",
    headers: {
      "Origin": ALLOWED_ORIGINS[0],
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ test: true }),
  });

  await response.text();
  
  const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
  assertExists(allowOrigin, "POST responses should include CORS headers");
});

Deno.test("CORS: error responses include CORS headers", async () => {
  // Make a request that will return an error (no auth)
  const response = await fetch(`${FUNCTIONS_URL}/analyze-ats`, {
    method: "POST",
    headers: {
      "Origin": ALLOWED_ORIGINS[0],
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resume: "test",
      jobDescription: "test",
    }),
  });

  await response.text();
  
  // Even error responses should have CORS headers
  const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
  assertExists(allowOrigin, "Error responses should include CORS headers");
});

Deno.test("CORS: validates all allowed origins are defined", async () => {
  // Verify our allowed origins list is complete
  assertEquals(ALLOWED_ORIGINS.includes("https://resume-genius1.lovable.app"), true);
  assertEquals(ALLOWED_ORIGINS.includes("http://localhost:5173"), true);
  
  // Should have at least 3 origins (production, preview, localhost)
  assertEquals(ALLOWED_ORIGINS.length >= 3, true);
});

Deno.test("CORS: validates CORS methods allowed", async () => {
  const response = await fetch(`${FUNCTIONS_URL}/analyze-ats`, {
    method: "OPTIONS",
    headers: {
      "Origin": ALLOWED_ORIGINS[0],
      "Access-Control-Request-Method": "POST",
    },
  });

  await response.text();
  
  const allowMethods = response.headers.get("Access-Control-Allow-Methods");
  // Methods header might not be present if * is used, but if present should include POST
  if (allowMethods) {
    assertEquals(allowMethods.includes("POST"), true);
  }
});
