
# Add OG Image for Social Media Sharing

## Current State
- The SEO component and `index.html` reference `/og-image.png` but this file doesn't exist in the `public` folder
- All meta tags are properly configured, just missing the actual image

## Solution
Generate a professional OG image that matches the EvolvXTalent brand and save it to the public folder.

### Image Design Specifications
- **Dimensions**: 1200×630px (standard OG image size)
- **Background**: Dark gradient or professional dark blue to make the content pop
- **Brand Elements**:
  - EvolvXTalent logo/wordmark prominently displayed
  - The signature magenta-to-blue gradient accent (`#e107c6` → `#0d64ce`)
- **Content**:
  - Headline: "AI-Powered Resume Optimizer"
  - Tagline: "Land More Interviews with ATS-Optimized Resumes"
  - Visual elements suggesting AI/resume optimization (abstract document icons, sparkles, or score indicators)
- **Style**: Clean, modern SaaS aesthetic matching the current website design

### Implementation Steps
1. Generate the OG image using Lovable AI image generation
2. Save the image as `public/og-image.png`
3. Update the `index.html` theme-color meta tag to match the new primary blue (`#0d64ce`)

### Technical Notes
- No code changes needed to SEO component - it already references the correct path
- The image will be automatically served at `https://resume-genius1.lovable.app/og-image.png`
- Social platforms will pick up the image when URLs are shared
