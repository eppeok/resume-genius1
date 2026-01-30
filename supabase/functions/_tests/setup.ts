/**
 * Test environment setup for Supabase Edge Function tests
 * This file loads environment variables and provides common configuration
 */
import "https://deno.land/std@0.224.0/dotenv/load.ts";

// Environment variables from .env
export const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
export const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
export const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Default test timeout
export const DEFAULT_TIMEOUT = 30000;

// Test origins for CORS testing
export const ALLOWED_ORIGINS = [
  "https://resume-genius1.lovable.app",
  "https://id-preview--b35e338f-bffc-44f3-9115-efb92e2a0458.lovable.app",
  "http://localhost:5173",
];

export const UNKNOWN_ORIGIN = "https://malicious-site.com";

// Edge function base URL
export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

// Valid credit packs for testing
export const VALID_PACKS = {
  "10-credits": { credits: 10, price: 900 },
  "25-credits": { credits: 25, price: 1900 },
  "50-credits": { credits: 50, price: 2900 },
};
