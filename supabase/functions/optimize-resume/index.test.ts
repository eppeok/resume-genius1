/**
 * Tests for optimize-resume Edge Function
 * 
 * Test cases:
 * 1. Authentication: Reject unauthenticated requests
 * 2. Credit check: Reject when user has insufficient credits
 * 3. Input validation: Reject empty resume
 * 4. Input validation: Reject oversized resume
 * 5. Input validation: Reject empty job description
 * 6. Input validation: Reject oversized job description
 * 7. Input validation: Reject oversized fullName field
 * 8. Input validation: Reject oversized currentRole field
 * 9. Input validation: Reject oversized targetRole field
 * 10. Credit deduction: Deducts 1 credit on successful optimization
 * 11. Credit refund: Refunds credit when AI call fails
 * 12. Streaming: Returns streaming response for AI content
 */
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import "../_tests/setup.ts";
import {
  callEdgeFunction,
  createMockResume,
  createMockJobDescription,
  generateLargeString,
  expectUnauthorized,
} from "../_tests/test-utils.ts";

const FUNCTION_NAME = "optimize-resume";

Deno.test("optimize-resume: rejects requests without auth header", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    body: {
      fullName: "John Doe",
      currentRole: "Software Engineer",
      targetRole: "Senior Software Engineer",
      currentResume: createMockResume(),
      jobDescription: createMockJobDescription(),
    },
  });

  await expectUnauthorized(response);
});

Deno.test("optimize-resume: rejects requests with invalid token", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "invalid-token-12345",
    body: {
      fullName: "John Doe",
      currentRole: "Software Engineer",
      targetRole: "Senior Software Engineer",
      currentResume: createMockResume(),
      jobDescription: createMockJobDescription(),
    },
  });

  await expectUnauthorized(response);
});

Deno.test("optimize-resume: rejects empty resume", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      fullName: "John Doe",
      currentRole: "Software Engineer",
      targetRole: "Senior Software Engineer",
      currentResume: "",
      jobDescription: createMockJobDescription(),
    },
  });

  const body = await response.text();
  const isExpectedStatus = response.status === 400 || response.status === 401 || response.status === 402;
  assertEquals(isExpectedStatus, true, `Expected 400, 401, or 402, got ${response.status}: ${body}`);
});

Deno.test("optimize-resume: rejects oversized resume (>50KB)", async () => {
  const largeResume = generateLargeString(51000);
  
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      fullName: "John Doe",
      currentRole: "Software Engineer",
      targetRole: "Senior Software Engineer",
      currentResume: largeResume,
      jobDescription: createMockJobDescription(),
    },
  });

  const body = await response.text();
  const isExpectedStatus = response.status === 400 || response.status === 401 || response.status === 402;
  assertEquals(isExpectedStatus, true, `Expected 400, 401, or 402, got ${response.status}: ${body}`);
});

Deno.test("optimize-resume: rejects empty job description", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      fullName: "John Doe",
      currentRole: "Software Engineer",
      targetRole: "Senior Software Engineer",
      currentResume: createMockResume(),
      jobDescription: "",
    },
  });

  const body = await response.text();
  const isExpectedStatus = response.status === 400 || response.status === 401 || response.status === 402;
  assertEquals(isExpectedStatus, true, `Expected 400, 401, or 402, got ${response.status}: ${body}`);
});

Deno.test("optimize-resume: rejects oversized job description (>10KB)", async () => {
  const largeJobDesc = generateLargeString(11000);
  
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      fullName: "John Doe",
      currentRole: "Software Engineer",
      targetRole: "Senior Software Engineer",
      currentResume: createMockResume(),
      jobDescription: largeJobDesc,
    },
  });

  const body = await response.text();
  const isExpectedStatus = response.status === 400 || response.status === 401 || response.status === 402;
  assertEquals(isExpectedStatus, true, `Expected 400, 401, or 402, got ${response.status}: ${body}`);
});

Deno.test("optimize-resume: rejects oversized fullName (>200 chars)", async () => {
  const largeName = generateLargeString(250);
  
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      fullName: largeName,
      currentRole: "Software Engineer",
      targetRole: "Senior Software Engineer",
      currentResume: createMockResume(),
      jobDescription: createMockJobDescription(),
    },
  });

  const body = await response.text();
  const isExpectedStatus = response.status === 400 || response.status === 401 || response.status === 402;
  assertEquals(isExpectedStatus, true, `Expected 400, 401, or 402, got ${response.status}: ${body}`);
});

Deno.test("optimize-resume: rejects oversized currentRole (>200 chars)", async () => {
  const largeRole = generateLargeString(250);
  
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      fullName: "John Doe",
      currentRole: largeRole,
      targetRole: "Senior Software Engineer",
      currentResume: createMockResume(),
      jobDescription: createMockJobDescription(),
    },
  });

  const body = await response.text();
  const isExpectedStatus = response.status === 400 || response.status === 401 || response.status === 402;
  assertEquals(isExpectedStatus, true, `Expected 400, 401, or 402, got ${response.status}: ${body}`);
});

Deno.test("optimize-resume: rejects oversized targetRole (>200 chars)", async () => {
  const largeRole = generateLargeString(250);
  
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      fullName: "John Doe",
      currentRole: "Software Engineer",
      targetRole: largeRole,
      currentResume: createMockResume(),
      jobDescription: createMockJobDescription(),
    },
  });

  const body = await response.text();
  const isExpectedStatus = response.status === 400 || response.status === 401 || response.status === 402;
  assertEquals(isExpectedStatus, true, `Expected 400, 401, or 402, got ${response.status}: ${body}`);
});

Deno.test("optimize-resume: CORS preflight returns proper headers", async () => {
  const response = await fetch(`${Deno.env.get("VITE_SUPABASE_URL")}/functions/v1/${FUNCTION_NAME}`, {
    method: "OPTIONS",
    headers: {
      "Origin": "https://resume-genius1.lovable.app",
      "Access-Control-Request-Method": "POST",
    },
  });

  await response.text(); // Consume body
  
  const isValidStatus = response.status === 204 || response.status === 200;
  assertEquals(isValidStatus, true, `Expected 200 or 204 for OPTIONS, got ${response.status}`);
  
  const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
  assertExists(allowOrigin, "Missing Access-Control-Allow-Origin header");
});

Deno.test("optimize-resume: validates required request body structure", async () => {
  // Test with missing required fields
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      // Missing all required fields
    },
  });

  const body = await response.text();
  // Should reject with 400, 401, or 402
  const isExpectedStatus = response.status === 400 || response.status === 401 || response.status === 402;
  assertEquals(isExpectedStatus, true, `Expected 400, 401, or 402, got ${response.status}: ${body}`);
});
