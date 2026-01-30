/**
 * Shared test utilities for Edge Function tests
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  SUPABASE_SERVICE_ROLE_KEY,
  FUNCTIONS_URL 
} from "./setup.ts";

export interface TestUser {
  id: string;
  email: string;
  accessToken: string;
}

/**
 * Create a test user and return auth credentials
 */
export async function createTestUser(
  email: string = `test-${Date.now()}@example.com`,
  password: string = "TestPassword123!"
): Promise<TestUser> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  if (!data.user || !data.session) {
    throw new Error("No user or session returned from signup");
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    accessToken: data.session.access_token,
  };
}

/**
 * Sign in an existing test user
 */
export async function signInTestUser(
  email: string,
  password: string
): Promise<TestUser> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to sign in: ${error.message}`);
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    accessToken: data.session.access_token,
  };
}

/**
 * Cleanup test user and all associated data
 */
export async function cleanupTestUser(userId: string): Promise<void> {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("No service role key - skipping cleanup");
    return;
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Delete associated data
  await adminClient.from("resumes").delete().eq("user_id", userId);
  await adminClient.from("bookmarked_jobs").delete().eq("user_id", userId);
  await adminClient.from("job_searches").delete().eq("user_id", userId);
  await adminClient.from("credit_transactions").delete().eq("user_id", userId);
  await adminClient.from("coupon_redemptions").delete().eq("user_id", userId);
  await adminClient.from("referrals").delete().eq("referrer_id", userId);
  await adminClient.from("referrals").delete().eq("referred_id", userId);
  await adminClient.from("user_roles").delete().eq("user_id", userId);
  await adminClient.from("profiles").delete().eq("id", userId);

  // Delete auth user
  await adminClient.auth.admin.deleteUser(userId);
}

/**
 * Set credits for a test user
 */
export async function setUserCredits(
  userId: string,
  credits: number
): Promise<void> {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Service role key required to set credits");
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const { error } = await adminClient
    .from("profiles")
    .update({ credits })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to set credits: ${error.message}`);
  }
}

/**
 * Get current credits for a user
 */
export async function getUserCredits(userId: string): Promise<number> {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Service role key required");
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const { data, error } = await adminClient
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to get credits: ${error.message}`);
  }

  return data.credits;
}

/**
 * Create mock resume text for testing
 */
export function createMockResume(): string {
  return `
John Doe
Software Engineer
email: john.doe@example.com
phone: +1-555-123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development.
Proficient in JavaScript, TypeScript, React, and Node.js.

WORK EXPERIENCE

Senior Software Engineer | Tech Company Inc | 2020 - Present
- Led development of customer-facing web applications
- Increased application performance by 40%
- Mentored junior developers

Software Engineer | Startup Co | 2018 - 2020
- Built RESTful APIs using Node.js and Express
- Implemented CI/CD pipelines
- Collaborated with cross-functional teams

EDUCATION

Bachelor of Science in Computer Science
University of Technology | 2018

SKILLS
JavaScript, TypeScript, React, Node.js, Python, SQL, Git, AWS
  `.trim();
}

/**
 * Create mock job description for testing
 */
export function createMockJobDescription(): string {
  return `
Senior Software Engineer - Full Stack

We are looking for a Senior Software Engineer to join our team.

Requirements:
- 5+ years of experience in software development
- Strong proficiency in JavaScript/TypeScript
- Experience with React and Node.js
- Experience with cloud services (AWS, GCP)
- Excellent communication skills

Responsibilities:
- Design and implement scalable web applications
- Lead technical projects and mentor junior engineers
- Collaborate with product and design teams
- Participate in code reviews and architecture discussions

Benefits:
- Competitive salary
- Remote work options
- Health insurance
- Professional development budget
  `.trim();
}

/**
 * Call an edge function with optional auth
 */
export async function callEdgeFunction(
  functionName: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string;
    origin?: string;
    headers?: Record<string, string>;
  } = {}
): Promise<Response> {
  const {
    method = "POST",
    body,
    token,
    origin,
    headers = {},
  } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (origin) {
    requestHeaders["Origin"] = origin;
  }

  return await fetch(`${FUNCTIONS_URL}/${functionName}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Assert response is unauthorized (401)
 */
export async function expectUnauthorized(response: Response): Promise<void> {
  const body = await response.text();
  if (response.status !== 401) {
    throw new Error(`Expected 401, got ${response.status}: ${body}`);
  }
}

/**
 * Assert response is a validation error (400)
 */
export async function expectValidationError(
  response: Response,
  expectedMessage?: string
): Promise<void> {
  const body = await response.text();
  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}: ${body}`);
  }
  if (expectedMessage) {
    const data = JSON.parse(body);
    if (!data.error?.includes(expectedMessage)) {
      throw new Error(`Expected error to include "${expectedMessage}", got "${data.error}"`);
    }
  }
}

/**
 * Assert response is insufficient credits (402)
 */
export async function expectInsufficientCredits(response: Response): Promise<void> {
  const body = await response.text();
  if (response.status !== 402) {
    throw new Error(`Expected 402, got ${response.status}: ${body}`);
  }
}

/**
 * Generate a large string of specified length
 */
export function generateLargeString(sizeInBytes: number): string {
  return "x".repeat(sizeInBytes);
}
