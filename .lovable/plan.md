

# Fix PDF Parsing CORS Error

## Problem Identified
The PDF parsing is failing with "Unable to connect to server" because the CORS configuration in `supabase/functions/_shared/cors.ts` is missing headers that the Supabase client automatically includes in requests.

When the browser sends a preflight (OPTIONS) request before the actual POST, the server's `Access-Control-Allow-Headers` must list ALL headers the client will send. The current config only allows:
- `authorization`
- `x-client-info`
- `apikey`
- `content-type`

But the Supabase JavaScript client also sends:
- `x-supabase-client-platform`
- `x-supabase-client-platform-version`
- `x-supabase-client-runtime`
- `x-supabase-client-runtime-version`

When these headers aren't explicitly allowed, the browser blocks the request entirely (CORS policy violation), which manifests as "Failed to fetch".

## Solution
Update the shared CORS configuration to include all headers that the Supabase client sends. This will fix the parse-pdf function and any other function using the shared CORS file.

## Changes Required

### File: `supabase/functions/_shared/cors.ts`
Update the `Access-Control-Allow-Headers` to include the additional Supabase client headers:

```typescript
return {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};
```

## Technical Details

| Aspect | Details |
|--------|---------|
| Root Cause | Missing CORS headers causing preflight failure |
| Affected Functions | `parse-pdf` and any other function using `_shared/cors.ts` |
| Fix Location | `supabase/functions/_shared/cors.ts` line 24 |
| Risk Level | Low - additive change only |

## Verification
After this fix, uploading a PDF resume should successfully connect to the server and parse the file. The retry button will also work correctly for any subsequent attempts.

