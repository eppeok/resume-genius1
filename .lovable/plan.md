

# Fix Job Search Issues

## Problem Summary
The job search feature appears not to work for users. Investigation reveals:
1. The edge function **works correctly** (verified with direct API call - returns valid job results)
2. The function takes 60-90 seconds due to Firecrawl search + AI processing
3. Client-side fetch has no timeout handling
4. Console shows a React ref warning in JobSearchPopup (minor)

## Root Causes

### 1. Missing Client-Side Timeout
The `searchJobs()` function in `src/lib/api/jobs.ts` has no timeout handling. Long requests (~90 seconds) may fail silently or confuse users.

### 2. No Loading Progress Feedback
The UI shows "Searching..." but doesn't indicate this is a long operation. Users may think it's stuck.

### 3. Inconsistent CORS Configuration
The `search-jobs` function uses permissive inline CORS (`"*"`) instead of the shared restricted configuration. This works but is inconsistent with security standards.

### 4. React Ref Warning (Minor)
`DialogFooter` has a ref warning that should be fixed for cleaner console.

## Solution

### Part 1: Add Timeout and Retry Logic to Client

**File: `src/lib/api/jobs.ts`**

Add a 2-minute timeout with AbortController and improve error messages:

```text
Changes:
- Add AbortController with 120-second timeout
- Provide clearer error messages for timeout vs network failure
- Clean up timeout on success
```

### Part 2: Improve UI Feedback

**File: `src/components/JobSearchPopup.tsx`**

Add visual feedback for long searches:

```text
Changes:
- Add a progress message that updates during search
- Inform users the search may take 30-60 seconds
- Fix DialogFooter ref warning using asChild pattern
```

### Part 3: Standardize CORS Configuration

**File: `supabase/functions/search-jobs/index.ts`**

Use the shared CORS module for consistency:

```text
Changes:
- Import getCorsHeaders and handleCorsPreflightRequest from shared module
- Apply dynamic CORS headers based on request origin
```

## Implementation Details

### `src/lib/api/jobs.ts` Changes

Add timeout handling:

```typescript
export async function searchJobs(request: JobSearchRequest): Promise<JobSearchResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("You must be logged in to search for jobs");
  }

  // Set 2-minute timeout for job search (it involves web scraping + AI processing)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-jobs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to search for jobs");
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error("Job search timed out. Please try again.");
      }
      if (error.message === 'Failed to fetch') {
        throw new Error("Unable to reach the server. Please check your connection and try again.");
      }
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}
```

### `src/components/JobSearchPopup.tsx` Changes

Add search progress indicator and fix ref warning:

```typescript
// Add to state:
const [searchProgress, setSearchProgress] = useState("");

// In handleSearch, add progress updates:
const handleSearch = async () => {
  // ... validation ...
  
  setIsSearching(true);
  setSearchProgress("Searching job boards...");
  setJobs([]);
  setHasSearched(false);

  // Progress updates
  const progressInterval = setInterval(() => {
    setSearchProgress((prev) => {
      if (prev === "Searching job boards...") return "Analyzing job listings...";
      if (prev === "Analyzing job listings...") return "Matching with your profile...";
      return "Finalizing results...";
    });
  }, 15000);

  try {
    const result = await searchJobs({...});
    // ... rest of success handling ...
  } catch (error) {
    // ... error handling ...
  } finally {
    clearInterval(progressInterval);
    setIsSearching(false);
    setSearchProgress("");
  }
};

// In the loading UI, show progress:
{isSearching ? (
  <>
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    {searchProgress || "Searching..."}
  </>
) : (/* ... */)}
```

Also add a note below the button when searching:
```typescript
{isSearching && (
  <p className="text-xs text-muted-foreground text-center">
    This typically takes 30-60 seconds
  </p>
)}
```

### `supabase/functions/search-jobs/index.ts` Changes

Update to use shared CORS configuration:

```typescript
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  
  // ... rest of function, replacing all hardcoded corsHeaders with dynamic one ...
});
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/api/jobs.ts` | Add AbortController timeout (120s), improve error messages |
| `src/components/JobSearchPopup.tsx` | Add progress indicator, timing note, fix ref warning |
| `supabase/functions/search-jobs/index.ts` | Use shared CORS module |

## Expected Outcome
- Users see clear progress during the 30-90 second search
- Timeout errors are clearly communicated instead of silent failures
- CORS configuration is consistent with other edge functions
- Console is cleaner (no ref warning)

