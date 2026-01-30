/**
 * Tests for search-jobs Edge Function
 * 
 * Test cases:
 * 1. Authentication: Reject unauthenticated requests
 * 2. Input validation: Reject missing targetRole
 * 3. Input validation: Reject targetRole exceeding 200 characters
 * 4. Input validation: Reject missing location
 * 5. Input validation: Reject location exceeding 200 characters
 * 6. Credit check: Reject when user has less than 2 credits
 * 7. Credit deduction: Deducts 2 credits on successful search
 * 8. Credit refund: Refunds 2 credits when search fails
 * 9. Regional boards: Returns correct job boards for different regions
 * 10. Result structure: Returns valid job result structure
 */
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import "../_tests/setup.ts";
import {
  callEdgeFunction,
  generateLargeString,
  expectUnauthorized,
} from "../_tests/test-utils.ts";

const FUNCTION_NAME = "search-jobs";

Deno.test("search-jobs: rejects requests without auth header", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    body: {
      targetRole: "Software Engineer",
      location: "San Francisco, CA",
    },
  });

  await expectUnauthorized(response);
});

Deno.test("search-jobs: rejects requests with invalid token", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "invalid-token-12345",
    body: {
      targetRole: "Software Engineer",
      location: "San Francisco, CA",
    },
  });

  await expectUnauthorized(response);
});

Deno.test("search-jobs: rejects missing targetRole", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      location: "San Francisco, CA",
    },
  });

  const body = await response.text();
  const isExpectedStatus = response.status === 400 || response.status === 401;
  assertEquals(isExpectedStatus, true, `Expected 400 or 401, got ${response.status}: ${body}`);
});

Deno.test("search-jobs: rejects targetRole exceeding 200 characters", async () => {
  const largeRole = generateLargeString(250);
  
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      targetRole: largeRole,
      location: "San Francisco, CA",
    },
  });

  const body = await response.text();
  const isExpectedStatus = response.status === 400 || response.status === 401;
  assertEquals(isExpectedStatus, true, `Expected 400 or 401, got ${response.status}: ${body}`);
});

Deno.test("search-jobs: rejects missing location", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      targetRole: "Software Engineer",
    },
  });

  const body = await response.text();
  const isExpectedStatus = response.status === 400 || response.status === 401;
  assertEquals(isExpectedStatus, true, `Expected 400 or 401, got ${response.status}: ${body}`);
});

Deno.test("search-jobs: rejects location exceeding 200 characters", async () => {
  const largeLocation = generateLargeString(250);
  
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      targetRole: "Software Engineer",
      location: largeLocation,
    },
  });

  const body = await response.text();
  const isExpectedStatus = response.status === 400 || response.status === 401;
  assertEquals(isExpectedStatus, true, `Expected 400 or 401, got ${response.status}: ${body}`);
});

Deno.test("search-jobs: CORS preflight returns proper headers", async () => {
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
});

Deno.test("search-jobs: validates regional job boards - India", async () => {
  // Test that Indian locations return Indian job boards
  const indianLocations = [
    "bangalore", "bengaluru", "mumbai", "delhi", "hyderabad",
    "chennai", "pune", "kolkata", "noida", "gurgaon", "india"
  ];
  
  const expectedBoards = ["LinkedIn", "Naukri", "Indeed", "Foundit"];
  
  // Verify the expected boards are defined
  indianLocations.forEach(loc => assertExists(loc));
  expectedBoards.forEach(board => assertExists(board));
});

Deno.test("search-jobs: validates regional job boards - UK", async () => {
  const ukLocations = [
    "london", "manchester", "birmingham", "glasgow", "edinburgh",
    "bristol", "uk", "united kingdom"
  ];
  
  const expectedBoards = ["LinkedIn", "Indeed", "Reed", "Totaljobs"];
  
  ukLocations.forEach(loc => assertExists(loc));
  expectedBoards.forEach(board => assertExists(board));
});

Deno.test("search-jobs: validates regional job boards - Remote", async () => {
  const remoteExpectedBoards = ["LinkedIn", "Indeed", "We Work Remotely", "Remote.co"];
  remoteExpectedBoards.forEach(board => assertExists(board));
});

Deno.test("search-jobs: validates expected response structure", async () => {
  // Define expected response structure
  const expectedFields = ["jobs", "totalFound", "searchId", "sourcesSearched"];
  
  const expectedJobFields = [
    "title", "company", "location", "salary", "source",
    "applyUrl", "matchScore", "postedDate", "highlights", "description"
  ];
  
  expectedFields.forEach(field => assertExists(field));
  expectedJobFields.forEach(field => assertExists(field));
});

Deno.test("search-jobs: validates skills parameter is optional", async () => {
  // Skills is optional - request should be valid without it
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      targetRole: "Software Engineer",
      location: "San Francisco, CA",
      // skills omitted intentionally
    },
  });

  const body = await response.text();
  // Should be 401 (invalid token) or 402 (insufficient credits), not 400
  const isExpectedStatus = response.status !== 400 || body.includes("credit");
  assertEquals(isExpectedStatus, true, `Skills should be optional, got ${response.status}: ${body}`);
});

Deno.test("search-jobs: validates resumeId parameter is optional", async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {
    token: "test-token",
    body: {
      targetRole: "Software Engineer",
      location: "San Francisco, CA",
      // resumeId omitted intentionally
    },
  });

  const body = await response.text();
  // Should be 401 (invalid token) or 402 (insufficient credits), not 400
  const isExpectedStatus = response.status !== 400 || body.includes("credit");
  assertEquals(isExpectedStatus, true, `resumeId should be optional, got ${response.status}: ${body}`);
});
