/**
 * Shared PDF Template Utilities
 * Provides consistent text handling, wrapping, and layout helpers
 * 
 * NO TRUNCATION - All content displays fully and wraps naturally
 */

/**
 * Normalizes whitespace in text - removes double spaces and trims
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Prepares bullet points for PDF - cleans whitespace only (no truncation)
 */
export function prepareBullets(bullets: string[]): string[] {
  return bullets.map(bullet => normalizeWhitespace(bullet));
}

/**
 * Prepares skills for PDF - cleans and limits count only (no truncation)
 */
export function prepareSkills(skills: string[], maxCount: number = 15): string[] {
  return skills
    .slice(0, maxCount)
    .map(skill => normalizeWhitespace(skill));
}

/**
 * Common flex row styles that allow proper wrapping
 */
export const flexRowSafe = {
  flexDirection: 'row' as const,
  flexWrap: 'wrap' as const,
  alignItems: 'flex-start' as const,
};

/**
 * Text styles that ensure proper wrapping without truncation
 */
export const textWrapSafe = {
  flexShrink: 1,
  flexGrow: 0,
};

/**
 * Fixed width element that doesn't shrink
 */
export const fixedWidthElement = {
  flexShrink: 0,
  flexGrow: 0,
};

/**
 * Entry container styles that keep entries together when possible
 * Uses minPresenceAhead to ensure at least some content fits before page break
 */
export const entryWrapStyles = {
  minPresenceAhead: 50,
};

/**
 * Section title styles to prevent orphaned headers
 */
export const sectionTitleWrapStyles = {
  minPresenceAhead: 80,
};
