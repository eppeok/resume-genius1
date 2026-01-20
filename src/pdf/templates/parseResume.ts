/**
 * Smart Resume Parser - Transforms markdown content into structured resume data
 * Detects job entries, education, skills, and other sections intelligently
 */

export interface ResumeEntry {
  title: string;        // Job title or Degree
  organization: string; // Company or School
  location?: string;
  dateRange?: string;
  bullets: string[];
}

export interface ParsedResume {
  summary: string[];
  experience: ResumeEntry[];
  education: ResumeEntry[];
  skills: string[];
  certifications: ResumeEntry[];
  projects: ResumeEntry[];
  other: { title: string; content: string[] }[];
}

// Date pattern matching
const DATE_PATTERNS = [
  /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}/gi,
  /\d{1,2}\/\d{4}/g,
  /\d{4}\s*[-–—]\s*(?:Present|Current|\d{4})/gi,
  /(?:Present|Current)/gi,
];

// Match job entry formats like: "**Title** | Company | Date" or "### Title at Company (Date)"
const JOB_ENTRY_PATTERNS = [
  /^###?\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/,  // ### Title | Company | Date
  /^###?\s*(.+?)\s+at\s+(.+?)\s*\((.+)\)$/,    // ### Title at Company (Date)
  /^\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+)$/,  // **Title** | Company | Date
  /^\*\*(.+?)\*\*\s+at\s+(.+?)\s*\((.+)\)$/,   // **Title** at Company (Date)
  /^(.+?)\s*[-–—]\s*(.+?)\s*[-–—]\s*(.+)$/,    // Title - Company - Date
];

// Match education formats
const EDU_PATTERNS = [
  /^###?\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/,  // ### Degree | School | Date
  /^\*\*(.+?)\*\*\s*[-–—,]\s*(.+)/,            // **Degree** - School
];

function extractDate(text: string): string | undefined {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return undefined;
}

function parseJobEntry(line: string): ResumeEntry | null {
  for (const pattern of JOB_ENTRY_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      const [, title, org, date] = match;
      // Check if there's a location in the org field (e.g., "Company, City")
      const orgParts = org.split(/,\s*/);
      return {
        title: cleanText(title),
        organization: cleanText(orgParts[0]),
        location: orgParts[1] ? cleanText(orgParts[1]) : undefined,
        dateRange: cleanText(date),
        bullets: [],
      };
    }
  }
  
  // Fallback: detect bold text as potential job title
  const boldMatch = line.match(/^\*\*(.+?)\*\*/);
  if (boldMatch) {
    const rest = line.replace(/^\*\*.+?\*\*\s*/, '');
    const dateMatch = extractDate(rest);
    const orgMatch = rest.replace(dateMatch || '', '').replace(/[|,\-–—]/g, ' ').trim();
    
    return {
      title: cleanText(boldMatch[1]),
      organization: cleanText(orgMatch) || '',
      dateRange: dateMatch,
      bullets: [],
    };
  }
  
  return null;
}

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^#+\s*/, '')
    .replace(/^\s*[-•]\s*/, '')
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim();
}

function isBulletPoint(line: string): boolean {
  return /^[-•*]\s+/.test(line.trim()) || /^\d+\.\s+/.test(line.trim());
}

function extractBulletText(line: string): string {
  const text = line.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '').trim();
  // Normalize whitespace within bullet text
  return text.replace(/\s+/g, ' ');
}

function categorizeSection(title: string): 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects' | 'other' {
  const lower = title.toLowerCase();
  
  if (lower.includes('summary') || lower.includes('objective') || lower.includes('profile') || lower.includes('about')) {
    return 'summary';
  }
  if (lower.includes('experience') || lower.includes('work') || lower.includes('employment') || lower.includes('career')) {
    return 'experience';
  }
  if (lower.includes('education') || lower.includes('academic') || lower.includes('degree')) {
    return 'education';
  }
  if (lower.includes('skill') || lower.includes('competenc') || lower.includes('technical') || lower.includes('technologies') || lower.includes('tools')) {
    return 'skills';
  }
  if (lower.includes('certif') || lower.includes('license') || lower.includes('credential')) {
    return 'certifications';
  }
  if (lower.includes('project') || lower.includes('portfolio')) {
    return 'projects';
  }
  
  return 'other';
}

export function parseResume(markdown: string): ParsedResume {
  const result: ParsedResume = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    other: [],
  };
  
  if (!markdown) return result;
  
  const lines = markdown.split('\n');
  let currentSection: ReturnType<typeof categorizeSection> = 'other';
  let currentSectionTitle = '';
  let currentEntry: ResumeEntry | null = null;
  let currentOtherContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    // Skip main title (# Name)
    if (line.startsWith('# ') && !line.startsWith('## ')) continue;
    
    // Detect section headers (## Section)
    if (line.startsWith('## ')) {
      // Save previous entry if exists
      if (currentEntry) {
        if (currentSection === 'experience') result.experience.push(currentEntry);
        else if (currentSection === 'education') result.education.push(currentEntry);
        else if (currentSection === 'certifications') result.certifications.push(currentEntry);
        else if (currentSection === 'projects') result.projects.push(currentEntry);
        currentEntry = null;
      }
      
      // Save previous "other" section
      if (currentSection === 'other' && currentSectionTitle && currentOtherContent.length) {
        result.other.push({ title: currentSectionTitle, content: currentOtherContent });
        currentOtherContent = [];
      }
      
      currentSectionTitle = cleanText(line.replace('## ', ''));
      currentSection = categorizeSection(currentSectionTitle);
      continue;
    }
    
    // Handle subsection headers (### Entry)
    if (line.startsWith('### ')) {
      // Save previous entry
      if (currentEntry) {
        if (currentSection === 'experience') result.experience.push(currentEntry);
        else if (currentSection === 'education') result.education.push(currentEntry);
        else if (currentSection === 'certifications') result.certifications.push(currentEntry);
        else if (currentSection === 'projects') result.projects.push(currentEntry);
      }
      
      const entry = parseJobEntry(trimmedLine);
      if (entry) {
        currentEntry = entry;
      } else {
        // Just a plain header, treat as entry title
        currentEntry = {
          title: cleanText(line.replace('### ', '')),
          organization: '',
          bullets: [],
        };
      }
      continue;
    }
    
    // Handle content based on section type
    switch (currentSection) {
      case 'summary':
        const summaryText = cleanText(trimmedLine);
        if (summaryText) result.summary.push(summaryText);
        break;
        
      case 'skills':
        // Extract skills from various formats
        const skillParts = trimmedLine.split(/[,;|•·]/);
        for (const part of skillParts) {
          const skill = cleanText(part);
          // Limit skill length and filter duplicates
          if (skill && skill.length > 0 && skill.length < 40 && !result.skills.includes(skill)) {
            result.skills.push(skill);
          }
        }
        break;
        
      case 'experience':
      case 'education':
      case 'certifications':
      case 'projects':
        // Try to detect new entry
        const entry = parseJobEntry(trimmedLine);
        if (entry) {
          // Save previous entry
          if (currentEntry) {
            if (currentSection === 'experience') result.experience.push(currentEntry);
            else if (currentSection === 'education') result.education.push(currentEntry);
            else if (currentSection === 'certifications') result.certifications.push(currentEntry);
            else if (currentSection === 'projects') result.projects.push(currentEntry);
          }
          currentEntry = entry;
        } else if (currentEntry) {
          // Add to current entry
          if (isBulletPoint(trimmedLine)) {
            const bulletText = extractBulletText(trimmedLine);
            if (bulletText) {
              currentEntry.bullets.push(bulletText);
            }
          } else {
            // Could be company/org line or continuation
            const text = cleanText(trimmedLine);
            if (!currentEntry.organization && !isBulletPoint(text)) {
              // Check if it looks like an org line
              const dateInLine = extractDate(text);
              if (dateInLine && !currentEntry.dateRange) {
                currentEntry.dateRange = dateInLine;
                const orgText = text.replace(dateInLine, '').replace(/[|,\-–—]/g, ' ').trim();
                if (orgText) currentEntry.organization = orgText;
              } else if (text) {
                currentEntry.organization = text;
              }
            } else if (text && text.length > 0) {
              currentEntry.bullets.push(text);
            }
          }
        } else {
          // No current entry, create one from bold text or treat as general content
          const boldEntry = parseJobEntry(trimmedLine);
          if (boldEntry) {
            currentEntry = boldEntry;
          }
        }
        break;
        
      case 'other':
        const otherText = cleanText(trimmedLine);
        if (otherText) {
          currentOtherContent.push(otherText);
        }
        break;
    }
  }
  
  // Save final entry
  if (currentEntry) {
    if (currentSection === 'experience') result.experience.push(currentEntry);
    else if (currentSection === 'education') result.education.push(currentEntry);
    else if (currentSection === 'certifications') result.certifications.push(currentEntry);
    else if (currentSection === 'projects') result.projects.push(currentEntry);
  }
  
  // Save final "other" section
  if (currentSection === 'other' && currentSectionTitle && currentOtherContent.length) {
    result.other.push({ title: currentSectionTitle, content: currentOtherContent });
  }
  
  // Limit skills to prevent overflow
  result.skills = result.skills.slice(0, 20);
  
  return result;
}

// Utility to get initials from name
export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
