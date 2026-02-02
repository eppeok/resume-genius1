

# Fix PDF Upload "Unable to Connect to Server" Error

## Problem
Users are seeing "Unable to connect to the server. Please check your internet connection and try again." when uploading PDF files. This happens because:

1. The edge function throws errors when parsing FormData with invalid content-type headers
2. Error handling catches the error but the generic message isn't helpful
3. The "Failed to fetch" error on client side could be caused by CORS issues or function errors

## Root Cause Analysis
From the edge function logs:
- `TypeError: Missing content type`
- `TypeError: Cannot construct MultipartParser: multipart/form-data must provide a boundary`

These errors happen at `req.formData()` before proper validation, causing 500 errors.

## Solution

### 1. Improve Edge Function Error Handling (`supabase/functions/parse-pdf/index.ts`)

Add better validation before calling `req.formData()` to provide clearer error messages:

```text
Changes:
- Check Content-Type header exists and is valid before parsing
- Provide specific error message for missing/invalid content type
- Ensure CORS headers are always included in all response paths
```

### 2. Improve Client-Side Error Messages (`src/lib/parseResume.ts`)

Provide more helpful error messages based on the server response:

```text
Changes:
- Better differentiate between network errors and server errors
- Show the actual error from the server when available
- Add retry suggestion for transient failures
```

## Files to Modify

### `supabase/functions/parse-pdf/index.ts`

Add content-type validation before parsing FormData (after line 19, before line 22):

```typescript
// Validate content-type header before trying to parse
const contentType = req.headers.get("content-type");
if (!contentType || !contentType.includes("multipart/form-data")) {
  return new Response(
    JSON.stringify({ error: "Invalid request: Expected multipart/form-data" }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

### `src/lib/parseResume.ts`

Update error handling in `parsePDFServerSide()` (lines 85-98):

```typescript
// Improved error handling with better messages
} catch (error) {
  clearTimeout(timeoutId);
  
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      throw new Error("PDF parsing timed out. Please try a smaller file.");
    }
    // Check if it's a network connectivity issue
    if (error.message === 'Failed to fetch') {
      throw new Error("Unable to reach the server. This may be a temporary issue - please try again in a moment.");
    }
    throw error;
  }
  throw new Error("An unexpected error occurred while parsing the PDF");
}
```

## Implementation Steps

1. Update the edge function with content-type validation
2. Deploy the edge function
3. Update client-side error handling for clearer messages
4. Test with actual PDF upload

## Expected Outcome
- Users will see more helpful error messages
- The "Failed to fetch" scenario will have a clearer message with retry suggestion
- Invalid requests will get proper 400 errors instead of 500 crashes

