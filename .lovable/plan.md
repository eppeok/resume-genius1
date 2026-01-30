
# Job Recommendations Feature - Implementation Plan

## Overview
Add a feature that recommends relevant job openings to candidates based on their resume profile, target role, and location. The system will scrape jobs from multiple sources (LinkedIn, Indeed, Naukri, Google Jobs) based on location relevance.

## User Experience Flow

### Flow 1: After Resume Optimization (Primary)
1. After resume optimization completes, show a dismissible popup/dialog
2. Ask: "Would you like to see relevant job openings for your profile?"
3. If user clicks "Find Jobs" (costs 2 credit), search and display matching jobs
4. Jobs are saved and linked to the resume record

### Flow 2: Dedicated Jobs Page
1. New `/jobs` page accessible from navigation
2. User can search for jobs using their saved profile data
3. Can filter by role, location, and job sources
4. Each search costs 2 credit

---

## Technical Implementation

### Phase 1: Database Schema
Create a new `job_searches` table to store search results:

```text
job_searches table:
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- resume_id (uuid, nullable, foreign key to resumes)
- search_query (text) - the role/keywords searched
- location (text) - location filter used
- job_results (jsonb) - array of job listings
- sources_searched (text[]) - which sources were queried
- created_at (timestamp)
```

RLS Policies:
- Users can view/insert their own job searches
- Admins can view all job searches

### Phase 2: Backend - Edge Function
Create `supabase/functions/search-jobs/index.ts`:

1. **Authentication & Credit Check**
   - Verify user is authenticated
   - Check user has at least 2 credit
   - Deduct credit server-side before processing

2. **Job Search Logic**
   - Use Firecrawl to search Google Jobs (aggregates from multiple sources)
   - Construct search queries based on:
     - Target role from resume/form
     - Location from user profile
     - Key skills extracted from resume
   - For Indian locations: prioritize Naukri results via Google Jobs
   - For other locations: LinkedIn + Indeed via Google Jobs

3. **AI Processing**
   - Use Lovable AI (Gemini) to parse and rank jobs by relevance
   - Extract structured data: title, company, location, salary, apply link, match score

4. **Response Format**
   ```json
   {
     "jobs": [
       {
         "title": "Senior Software Engineer",
         "company": "Tech Corp",
         "location": "Bangalore, India",
         "salary": "INR 25-35 LPA",
         "source": "LinkedIn",
         "applyUrl": "https://...",
         "matchScore": 92,
         "postedDate": "2 days ago",
         "highlights": ["5+ years experience match", "React skills match"]
       }
     ],
     "totalFound": 25,
     "searchId": "uuid"
   }
   ```

### Phase 3: Frontend Components

#### New Components:

1. **`src/components/JobSearchPopup.tsx`**
   - Dialog/sheet that appears after optimization
   - Shows credit cost warning
   - "Find Jobs" and "Maybe Later" buttons
   - Loading state while searching

2. **`src/components/JobCard.tsx`**
   - Individual job listing card
   - Shows: title, company, location, salary, match score
   - "Apply" button opens external link
   - Highlights matching skills/experience

3. **`src/components/JobResultsList.tsx`**
   - Grid/list of JobCards
   - Sort by: relevance, date posted, salary
   - Filter by: source, location

4. **`src/pages/Jobs.tsx`**
   - Dedicated jobs page
   - Search form with role, location inputs
   - Display past job searches
   - New search functionality

#### Modifications:

1. **`src/pages/Optimize.tsx`**
   - Add state for job popup visibility
   - Show JobSearchPopup after successful optimization
   - Pass resume data to popup for context

2. **`src/components/Navigation.tsx`**
   - Add "Jobs" link to navigation menu

3. **`src/App.tsx`**
   - Add route for `/jobs` page

### Phase 4: API Integration with Firecrawl

The edge function will use Firecrawl's search feature:

```text
Search Strategy:
1. Primary: Google Jobs search
   - Query: "[target_role] jobs in [location]"
   - Firecrawl scrapes Google Jobs which aggregates from multiple sources

2. Source Detection:
   - Parse job listings to identify original source (LinkedIn, Indeed, Naukri, etc.)
   - Tag each result with its source

3. Location-Aware Sources:
   - India: Prioritize Naukri, LinkedIn India
   - US/Global: Prioritize LinkedIn, Indeed, Glassdoor
```

---

## File Structure

```text
New Files:
- supabase/functions/search-jobs/index.ts
- src/pages/Jobs.tsx
- src/components/JobSearchPopup.tsx
- src/components/JobCard.tsx
- src/components/JobResultsList.tsx
- src/lib/api/jobs.ts (API helper functions)

Modified Files:
- src/pages/Optimize.tsx (add popup trigger)
- src/components/Navigation.tsx (add Jobs link)
- src/App.tsx (add /jobs route)
- supabase/config.toml (add search-jobs function config)
```

---

## Cost & Credits

- Each job search costs 2 credit (1 credit more than resume optimization)
- Credit is deducted server-side before Firecrawl API call
- If search fails, credit is refunded
- Search results are cached in database for future reference

---

## Security Considerations

1. **Input Validation**: Validate role and location inputs for length and characters
2. **Rate Limiting**: Limit to 10 job searches per hour per user
3. **RLS Policies**: Users can only access their own job search history
4. **Credit Protection**: Deduct credits server-side with refund on failure
5. **URL Safety**: Validate and sanitize external job URLs before displaying

