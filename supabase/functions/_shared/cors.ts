// Shared CORS configuration for all edge functions
// SECURITY: Restrict allowed origins to prevent unauthorized cross-origin requests

const ALLOWED_ORIGINS = [
  "https://resume-genius1.lovable.app",
  "https://id-preview--b35e338f-bffc-44f3-9115-efb92e2a0458.lovable.app",
  "https://b35e338f-bffc-44f3-9115-efb92e2a0458.lovableproject.com",
  // Development origins
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:8080",
];

export function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  // Default to the production origin if no valid origin is provided
  let allowedOrigin = ALLOWED_ORIGINS[0];

  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    allowedOrigin = requestOrigin;
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
  };
}

export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin");
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin)
    });
  }
  return null;
}

export { ALLOWED_ORIGINS };
