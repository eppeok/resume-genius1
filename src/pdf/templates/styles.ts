/**
 * Shared PDF Template Utilities
 * Provides consistent text handling, wrapping, and layout helpers
 */

// Maximum character lengths to prevent overflow
export const TEXT_LIMITS = {
  bulletPoint: 200,      // Max chars per bullet point
  skillName: 35,         // Max chars per skill
  summary: 1500,         // Max chars for summary
  organizationName: 60,  // Max chars for company/school name
  jobTitle: 50,          // Max chars for job title
  dateRange: 25,         // Max chars for date
};

/**
 * Truncates text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Normalizes whitespace in text - removes double spaces and trims
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Truncates a URL for display while keeping it recognizable
 */
export function truncateUrl(url: string, maxLength: number = 35): string {
  if (!url) return '';
  // Remove protocol and www
  let display = url.replace(/^https?:\/\/(www\.)?/, '');
  // Remove trailing slash
  display = display.replace(/\/$/, '');
  
  if (display.length <= maxLength) return display;
  
  // Keep domain and truncate path
  const parts = display.split('/');
  if (parts.length > 1) {
    const domain = parts[0];
    if (domain.length < maxLength - 5) {
      return domain + '/...';
    }
  }
  
  return display.substring(0, maxLength - 3) + '...';
}

/**
 * Common flex row styles that prevent overflow
 */
export const flexRowSafe = {
  flexDirection: 'row' as const,
  flexWrap: 'wrap' as const,
  alignItems: 'flex-start' as const,
};

/**
 * Text styles that ensure proper wrapping
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
 * Prepares bullet points for PDF - cleans and truncates
 */
export function prepareBullets(bullets: string[], maxLength: number = TEXT_LIMITS.bulletPoint): string[] {
  return bullets.map(bullet => {
    const cleaned = normalizeWhitespace(bullet);
    return truncateText(cleaned, maxLength);
  });
}

/**
 * Prepares skills for PDF - cleans, truncates, and limits count
 */
export function prepareSkills(skills: string[], maxCount: number = 15, maxLength: number = TEXT_LIMITS.skillName): string[] {
  return skills
    .slice(0, maxCount)
    .map(skill => truncateText(normalizeWhitespace(skill), maxLength));
}
