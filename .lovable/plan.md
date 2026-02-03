

# Fix Job Search Popup Prefill from Resume Form Data

## Problem

The Job Search popup fields (Target Role and Location) don't properly sync with the values entered in the resume optimization form. The current implementation uses `useState(initialRole)` which only sets the initial value when the component first mounts, not when the props change.

This means:
- If the popup component is rendered but closed, and the parent updates the props, the popup won't show the new values
- Reopening the popup after changing resume form data shows stale values

## Solution

Add a `useEffect` hook that syncs the local state with the incoming props whenever the popup opens or when the prop values change.

## Technical Changes

### File: `src/components/JobSearchPopup.tsx`

Add a `useEffect` hook after the state declarations to keep local state in sync with props:

```typescript
// Add useEffect import (already has useState, useMemo)
import { useState, useMemo, useEffect } from "react";

// After line 46, add this effect:
// Sync local state with props when popup opens or values change
useEffect(() => {
  if (open) {
    setTargetRole(initialRole);
    setLocation(initialLocation);
  }
}, [open, initialRole, initialLocation]);
```

This ensures that:
1. When the popup opens (`open` becomes true), the fields are populated with the latest values from the resume form
2. If the user closes and reopens with different resume data, it syncs correctly
3. The user can still edit the values if they want to search for something different

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/JobSearchPopup.tsx` | Add `useEffect` import and sync hook to update local state from props when popup opens |

## Expected Behavior After Fix

1. User fills in Target Role "Digital Marketing Manager" and Location "Mumbai, India" in the resume form
2. User optimizes resume
3. User clicks "Find Matching Jobs"
4. Popup opens with those exact values prefilled
5. If user closes popup and changes resume form data, reopening the popup shows the new values

