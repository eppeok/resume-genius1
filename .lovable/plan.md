
# Fix PDF Upload "Unable to Reach Server" Error

## Root Cause

The `parsePDFServerSide()` function in `src/lib/parseResume.ts` is missing the required `apikey` header when calling the parse-pdf backend function. Every other backend call in the app (e.g., job search) includes this header, but the PDF upload does not.

Without it, the backend gateway rejects the request before it reaches the function. The browser interprets this as "Failed to fetch", which displays as "Unable to reach the server."

## Fix

### File: `src/lib/parseResume.ts` (line 63-64)

Add the missing `apikey` header to the fetch call:

```typescript
// Current (broken):
headers: {
  Authorization: `Bearer ${session.access_token}`,
},

// Fixed:
headers: {
  Authorization: `Bearer ${session.access_token}`,
  apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
},
```

That is the only change needed. No edge function changes required.

## Why This Fixes It

The backend gateway requires the `apikey` header on all requests to route them to edge functions. The preflight OPTIONS request succeeds (it doesn't need apikey), but the actual POST is rejected at the gateway level -- before it reaches the parse-pdf function. This is why:
- Edge function logs show zero POST requests from the browser
- The browser gets a network-level failure ("Failed to fetch")
- The user sees "Unable to reach the server"
