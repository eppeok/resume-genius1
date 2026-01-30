

# Add Resume Match Score Preview After Parsing

## Overview
Add a feature that automatically calculates and displays a preliminary "match score" between the uploaded resume and job description as soon as both are available in the form. This gives users immediate feedback before they commit a credit to optimize.

## Current Flow
1. User fills out the form (name, target role, job description)
2. User uploads resume or pastes text
3. User clicks "Optimize" (costs 1 credit)
4. System analyzes original resume → shows score
5. System optimizes resume → shows improved score

## Proposed Flow
1. User fills out the form (name, target role, job description)
2. User uploads resume or pastes text
3. **NEW: System automatically shows a preview match score** (free, no credit cost)
4. User can see how well their resume matches before deciding to optimize
5. User clicks "Optimize" (costs 1 credit) → full optimization flow

## User Experience

```text
+----------------------------------+
|   Your Current Resume           |
|   [Upload PDF, DOCX, or TXT]    |
|   +--------------------------+  |
|   | Resume Content *         |  |
|   | [Parsed resume text...]  |  |
|   +--------------------------+  |
|                                  |
|   +---------------------------+  |
|   | Resume Match Preview      |  |
|   | ┌─────┐                   |  |
|   | │ 62% │ Match Score       |  |
|   | └─────┘                   |  |
|   | Your resume has moderate  |  |
|   | alignment with this role. |  |
|   | Optimize to improve!      |  |
|   +---------------------------+  |
+----------------------------------+
```

## Technical Implementation

### 1. Create New Component: `ResumeMatchPreview.tsx`
A lightweight component that displays the match score preview:
- Circular progress indicator (reusing ATSScoreCard with size="sm")
- Score interpretation text (Poor/Fair/Good/Excellent match)
- "Optimize to improve your score" CTA
- Loading state while analyzing
- Only visible when both resume AND job description are filled

### 2. Update `ResumeForm.tsx`
- Add state to track when both `currentResume` and `jobDescription` are filled
- Debounce the analysis call (500ms) to avoid excessive API calls while typing
- Show the `ResumeMatchPreview` component below the resume textarea
- Pass the score up to parent if needed

### 3. Create Edge Function: `quick-match-score`
A lightweight, **free** (no credit deduction) endpoint that:
- Takes resume text and job description
- Uses a simpler/faster AI prompt focused only on keyword matching
- Returns just the overall match percentage (0-100) and a brief assessment
- Has rate limiting to prevent abuse (e.g., 10 calls per user per hour)

**Why a new function instead of reusing `analyze-ats`?**
- The full ATS analysis is more comprehensive and should remain part of the paid flow
- Quick match is a teaser that encourages conversion
- Different rate limiting strategy (free but limited)

### 4. Rate Limiting Strategy
To prevent abuse of the free preview:
- Limit to 10 quick-match calls per user per hour
- Cache recent results in localStorage keyed by hash of resume+job description
- Show cached score if same inputs are detected

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/ResumeMatchPreview.tsx` | Create | New component for match score display |
| `src/components/ResumeForm.tsx` | Modify | Add preview component and debounced analysis trigger |
| `supabase/functions/quick-match-score/index.ts` | Create | Lightweight free match score endpoint |
| `supabase/config.toml` | Modify | Add new function configuration |

## Component Details

### ResumeMatchPreview Component Props
```typescript
interface ResumeMatchPreviewProps {
  resume: string;
  jobDescription: string;
}
```

### Quick Match Score Response
```typescript
interface QuickMatchResponse {
  score: number;           // 0-100
  assessment: string;      // "Poor" | "Fair" | "Good" | "Excellent"
  topMissingKeywords: string[];  // Up to 3 keywords to add
}
```

## Technical Considerations

- **Debouncing**: 500ms delay after user stops typing before triggering analysis
- **Minimum content**: Only analyze if resume has 100+ characters and job description has 50+ characters
- **Caching**: Store results in component state to avoid re-fetching on minor edits
- **Error handling**: Gracefully handle rate limits and show friendly message
- **No credit cost**: This preview is free to encourage users to try the full optimization

## Security Notes
- Rate limiting on the edge function to prevent abuse
- Same authentication requirement as other functions
- Input validation and length limits

