
# Consistent Margins & Golden Bullets for Professional Template

## Overview
This plan addresses two styling improvements for the Professional (Minimal) PDF template:
1. Align body content margins to match the header's internal padding
2. Add golden square bullets (■) to Certifications (and similar multi-line sections)

## Current State

### Margins
- **Page padding**: 72pt (1 inch) on all sides
- **Header internal padding**: 24pt horizontal
- **Body content**: Currently uses 0pt additional padding (just the page's 72pt)

The header visually appears to have different margins because its background extends edge-to-edge while text is padded 24pt inside.

### Certifications
- Currently uses the `CertificationItem` component with square bullets (■)
- Already displays golden bullets, but this confirms correct implementation

## Proposed Changes

### 1. Match Body Margins to Header

Adjust the page padding and header offsets so the content area has the same visual alignment as the header text (24pt from the colored edge):

| Area | Current | New |
|------|---------|-----|
| Page horizontal padding | 72pt | 48pt |
| Header horizontal margin | -72pt | -48pt |
| Header top margin | -72pt | -48pt |
| Page top padding | 72pt | 48pt |

This creates tighter margins (~0.67 inch) that match what the header appears to have visually.

### 2. Golden Bullets Confirmation
The Certifications section already uses golden square bullets (■) via the `CertificationItem` component. No changes needed unless other sections need similar treatment.

## Files to Modify

### `src/pdf/templates/MinimalTemplate.tsx`

**Page styles (lines 6-17)**:
```typescript
page: {
  fontSize: 10,
  fontFamily: "Helvetica",
  lineHeight: 1.5,
  backgroundColor: "#ffffff",
  paddingTop: 48,      // Was 72
  paddingBottom: 72,   // Keep bottom for page numbers if needed
  paddingLeft: 48,     // Was 72
  paddingRight: 48,    // Was 72
},
```

**Header band styles (lines 19-26)**:
```typescript
headerBand: {
  backgroundColor: "#1e3a5f",
  paddingHorizontal: 24,
  paddingTop: 28,
  paddingBottom: 24,
  marginHorizontal: -48,  // Was -72 (matches new page padding)
  marginTop: -48,         // Was -72
},
```

## Visual Result
- Body text will align with the header name/title text (both 24pt from the page edge visually)
- The navy header band still extends edge-to-edge
- Golden square bullets already appear on Certifications

## Technical Details

| Aspect | Details |
|--------|---------|
| Files Changed | 1 (MinimalTemplate.tsx) |
| Risk Level | Low - only affects PDF layout, no logic changes |
| Affected Output | Professional template PDF downloads |
