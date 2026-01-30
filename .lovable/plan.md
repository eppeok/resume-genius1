
# Apply Brand Gradient Throughout the UI

## Problem Identified

The gradient colors (`#e107c6` → `#0d64ce`) are defined in CSS but not actually applied to any elements. The utility classes `.text-gradient` and `.bg-gradient-primary` exist but are unused. Currently everything uses solid `text-primary` (magenta only).

## Files to Modify

### 1. `src/pages/Index.tsx`
Apply gradient to key elements on the landing page:
- **Hero headline**: Change `text-primary` to `text-gradient` for "ATS-Optimized"
- **Stats values**: Add `text-gradient` to the stat numbers (85%, 3, 30s)
- **Step numbers**: Change solid `bg-primary` to `bg-gradient-primary` on the step circles
- **CTA headline**: Add gradient text to "Ready to Land Your Dream Job?"

### 2. `src/components/ui/button.tsx`
Update the `hero` variant to use gradient background:
- Change from `bg-primary` to `bg-gradient-primary`
- This affects all "Get Started" and CTA buttons across the app

### 3. `src/components/HeroSection.tsx`
Already has `text-gradient` - no changes needed (though this component isn't currently used on Index)

### 4. `src/components/ATSScoreCard.tsx`
Apply gradient to score indicators:
- Update the circular progress stroke to use gradient colors

### 5. `src/components/ScoreBreakdown.tsx`
Apply gradient to progress bars:
- Use gradient for high-score progress bar fills

### 6. `src/pages/Login.tsx`, `src/pages/Signup.tsx`, `src/pages/ForgotPassword.tsx`, `src/pages/ResetPassword.tsx`
Add gradient text to page titles/headings to match branding

### 7. `src/components/Navigation.tsx`
Apply gradient to the credits badge or other accent elements

---

## Technical Details

### Gradient CSS (already defined in `src/index.css`):
```css
--gradient-primary: linear-gradient(180deg, hsl(310 97% 46%) 0%, hsl(213 89% 43%) 100%);
```

### Utility classes to use:
- `.text-gradient` - For gradient text (uses `bg-clip-text` + `text-transparent`)
- `.bg-gradient-primary` - For gradient backgrounds on buttons/elements

### Changes Summary:

| Location | Current | Change To |
|----------|---------|-----------|
| Index.tsx "ATS-Optimized" | `text-primary` | `text-gradient` |
| Index.tsx stats values | `text-primary` | `text-gradient` |
| Index.tsx step circles | `bg-primary` | `bg-gradient-primary` |
| Button hero variant | `bg-primary` | `bg-gradient-primary` |
| Auth page headings | `text-foreground` | Add `text-gradient` to brand name |
| ATSScoreCard circle | solid stroke | gradient stroke via SVG gradient def |

---

## Expected Result

After these changes, the magenta-to-blue gradient will be visible on:
- Main headlines and brand text
- All CTA buttons ("Get Started Free", "Start Optimizing")
- Step indicators
- Score cards
- Key UI accents throughout the app

This creates visual consistency with the logo's "Talent" gradient text.
