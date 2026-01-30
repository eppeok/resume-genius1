
# Comprehensive Edge-to-Edge Testing Plan for EvolvXTalent Platform

## ✅ IMPLEMENTATION COMPLETE

**Total Tests: 133 passing tests**

---

## Platform Overview

EvolvXTalent is a resume optimization platform with the following core features:
- **Authentication**: Signup, login, email verification, password reset, rate limiting
- **Resume Optimization**: PDF parsing, AI-powered ATS analysis and optimization
- **Job Search**: AI-powered job matching using Firecrawl
- **Payments**: Stripe checkout, credit purchases, coupon system
- **Referral System**: User referrals with credit rewards
- **Admin Panel**: User management, coupon management, activity logs

## Testing Strategy

I'll create Deno tests for all 8 edge functions and organize them systematically.

---

## Phase 1: Edge Function Tests

### 1. `analyze-ats` Function Tests
**File**: `supabase/functions/analyze-ats/index.test.ts`

Test cases:
- Authentication: Reject requests without auth header
- Authentication: Reject requests with invalid token
- Input validation: Reject empty resume
- Input validation: Reject resume exceeding 50KB limit
- Input validation: Reject empty job description
- Input validation: Reject job description exceeding 10KB limit
- Happy path: Returns valid ATS scores structure (overallScore, keywordMatch, formatting, sections, readability)
- Graceful degradation: Returns default scores when AI returns empty content

### 2. `optimize-resume` Function Tests
**File**: `supabase/functions/optimize-resume/index.test.ts`

Test cases:
- Authentication: Reject unauthenticated requests
- Credit check: Reject when user has insufficient credits
- Input validation: Reject empty resume (refunds credit)
- Input validation: Reject oversized resume (refunds credit)
- Input validation: Reject empty job description (refunds credit)
- Input validation: Reject oversized job description (refunds credit)
- Input validation: Reject oversized fullName field
- Input validation: Reject oversized currentRole field
- Input validation: Reject oversized targetRole field
- Credit deduction: Deducts 1 credit on successful optimization
- Credit refund: Refunds credit when AI call fails
- Referral system: Awards referral credits on first optimization
- Streaming: Returns streaming response for AI content

### 3. `parse-pdf` Function Tests
**File**: `supabase/functions/parse-pdf/index.test.ts`

Test cases:
- Authentication: Reject requests without auth header
- File validation: Reject requests without file
- File validation: Reject files larger than 5MB
- File validation: Reject non-PDF files
- Text extraction: Successfully extracts text from valid PDF
- AI OCR fallback: Uses AI OCR when basic extraction fails
- Validation: Rejects PDFs with no usable resume content

### 4. `search-jobs` Function Tests
**File**: `supabase/functions/search-jobs/index.test.ts`

Test cases:
- Authentication: Reject unauthenticated requests
- Input validation: Reject missing targetRole
- Input validation: Reject targetRole exceeding 200 characters
- Input validation: Reject missing location
- Input validation: Reject location exceeding 200 characters
- Credit check: Reject when user has less than 2 credits
- Credit deduction: Deducts 2 credits on successful search
- Credit refund: Refunds 2 credits when search fails
- Regional boards: Returns correct job boards for different regions (India, UK, US, etc.)
- Result structure: Returns valid job result structure with matchScore, applyUrl, etc.

### 5. `create-checkout` Function Tests
**File**: `supabase/functions/create-checkout/index.test.ts`

Test cases:
- Authentication: Reject requests without auth header
- Authentication: Reject requests with invalid token
- Validation: Reject missing pack_id
- Validation: Reject invalid pack_id
- Valid packs: Accept "10-credits", "25-credits", "50-credits"
- Pricing integrity: Server-side pricing matches expected values (900, 1900, 2900 cents)
- Coupon validation: Invalid coupon returns error
- Coupon validation: Already-used coupon returns error
- Coupon validation: Expired coupon returns error
- Coupon discount: Percentage discount applied correctly
- Coupon discount: Fixed discount applied correctly
- Coupon minimum: Enforces minimum price of 50 cents
- Origin allowlist: Accepts requests from allowed origins
- Origin allowlist: Rejects requests from unknown origins

### 6. `stripe-webhook` Function Tests
**File**: `supabase/functions/stripe-webhook/index.test.ts`

Test cases:
- Signature verification: Reject missing stripe-signature header
- Signature verification: Reject invalid signature
- Metadata validation: Reject missing user_id in metadata
- Metadata validation: Reject missing/invalid credits in metadata
- Metadata validation: Reject invalid pack_id
- Price verification: Reject if amount_total doesn't match expected price
- Duplicate prevention: Ignore duplicate session_id (replay attack protection)
- Credit addition: Successfully adds credits to user
- Transaction recording: Creates credit_transaction record
- Coupon tracking: Records coupon redemption when used
- Coupon tracking: Increments coupon usage count
- Email notification: Triggers purchase confirmation email

### 7. `send-purchase-email` Function Tests
**File**: `supabase/functions/send-purchase-email/index.test.ts`

Test cases:
- Authorization: Reject requests without service role key
- Authorization: Reject requests with regular user token
- Input validation: Reject missing user_id
- Input validation: Reject invalid user_id (not found)
- Email sending: Successfully sends confirmation email via Resend
- Email content: Includes correct credits, amount, and coupon info
- Configuration: Fails gracefully when RESEND_API_KEY missing

### 8. `send-referral-email` Function Tests
**File**: `supabase/functions/send-referral-email/index.test.ts`

Test cases:
- Authorization: Reject requests without service role key
- Input validation: Reject missing referrer_id or referred_id
- Input validation: Reject invalid user IDs
- Email sending: Sends email to both referrer and referred user
- Email content: Includes correct credit reward information

---

## Phase 2: Integration Test Scenarios

### User Journey Tests
**File**: `supabase/functions/_tests/integration/user-journey.test.ts`

```text
Full User Journey Flow:
1. User signs up with referral code
2. User logs in
3. User uploads PDF resume
4. User runs ATS analysis (free)
5. User optimizes resume (1 credit)
6. User views optimization results
7. Referrer receives referral credits
8. User searches for jobs (2 credits)
9. User bookmarks a job
10. User purchases more credits with coupon
11. User receives purchase confirmation email
```

---

## Phase 3: Security Tests

### Database RLS Tests
**File**: `supabase/functions/_tests/security/rls.test.ts`

Test cases:
- Anonymous users cannot read any tables
- Anonymous users cannot write to any tables
- Users can only read their own profile
- Users can only read their own resumes
- Users can only read their own bookmarks
- Users can only read their own transactions
- Admins can read all user data
- Admins can manage coupons

### CORS Security Tests
**File**: `supabase/functions/_tests/security/cors.test.ts`

Test cases:
- Allowed origins receive proper CORS headers
- Unknown origins fall back to production origin
- Preflight requests handled correctly

---

## Phase 4: Test Infrastructure

### Shared Test Utilities
**File**: `supabase/functions/_tests/test-utils.ts`

```typescript
// Test utilities will include:
- createTestUser(): Creates test user and returns auth token
- cleanupTestUser(): Removes test user and all associated data
- createTestResume(): Creates mock resume data
- createTestPDF(): Creates mock PDF file
- mockStripeWebhook(): Creates signed Stripe webhook payload
- expectUnauthorized(): Helper for auth tests
- expectValidationError(): Helper for input validation tests
```

### Environment Configuration
**File**: `supabase/functions/_tests/setup.ts`

```typescript
import "https://deno.land/std@0.224.0/dotenv/load.ts";

// Load environment variables from root .env
const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
```

---

## Technical Implementation Details

### Test File Structure
```text
supabase/functions/
  _tests/
    setup.ts              # Shared setup and environment
    test-utils.ts         # Helper functions
    integration/
      user-journey.test.ts
    security/
      rls.test.ts
      cors.test.ts
  analyze-ats/
    index.ts
    index.test.ts
  create-checkout/
    index.ts
    index.test.ts
  optimize-resume/
    index.ts
    index.test.ts
  parse-pdf/
    index.ts
    index.test.ts
  search-jobs/
    index.ts
    index.test.ts
  send-purchase-email/
    index.ts
    index.test.ts
  send-referral-email/
    index.ts
    index.test.ts
  stripe-webhook/
    index.ts
    index.test.ts
```

### Test Execution
All tests will be run using the Deno test runner with:
- `--allow-net` for HTTP requests
- `--allow-env` for environment variables
- 120-second timeout for longer integration tests

### Critical Test Patterns

1. **Always consume response bodies** to prevent resource leaks:
```typescript
const response = await fetch(url);
const body = await response.text();
assertEquals(response.status, 401);
```

2. **Use real deployed functions** via HTTP requests:
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/analyze-ats`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resume, jobDescription }),
  }
);
```

---

## Final Test Count (ACTUAL)

| Category | Tests |
|----------|-------|
| analyze-ats | 8 |
| optimize-resume | 11 |
| parse-pdf | 7 |
| search-jobs | 13 |
| create-checkout | 15 |
| stripe-webhook | 13 |
| send-purchase-email | 10 |
| send-referral-email | 10 |
| Integration (user-journey) | 18 |
| Security (CORS) | 9 |
| Security (RLS) | 19 |
| **Total** | **133 tests** |

---

## Test Run Command

```bash
# Run all tests
deno test --allow-net --allow-env supabase/functions/
```

---

## ✅ All Tests Passing

Last run: 133 passed | 0 failed
