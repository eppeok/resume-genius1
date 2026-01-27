// Input validation utilities for security
// SECURITY: Validates and sanitizes user inputs to prevent XSS and injection attacks

/**
 * Validates LinkedIn URL format
 * Allows linkedin.com/in/ and linkedin.com/company/ URLs
 */
export function isValidLinkedInUrl(url: string): boolean {
  if (!url || url.trim() === "") return true; // Empty is valid (optional field)

  const trimmedUrl = url.trim().toLowerCase();

  // Allow URLs with or without protocol
  const linkedInPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[\w\-]+\/?$/i;

  return linkedInPattern.test(trimmedUrl);
}

/**
 * Normalizes LinkedIn URL to include https://
 */
export function normalizeLinkedInUrl(url: string): string {
  if (!url || url.trim() === "") return "";

  let normalized = url.trim();

  // Add https:// if no protocol specified
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }

  // Convert http to https
  if (normalized.startsWith("http://")) {
    normalized = normalized.replace("http://", "https://");
  }

  return normalized;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === "") return false;

  // RFC 5322 simplified email regex
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
}

/**
 * Password strength validation
 * Requires: minimum 8 characters, at least one uppercase, one lowercase, one number
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password) {
    return { isValid: false, errors: ["Password is required"] };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates password strength score (0-4)
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: "weak" | "fair" | "good" | "strong";
} {
  if (!password) return { score: 0, label: "weak" };

  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const labels: Record<number, "weak" | "fair" | "good" | "strong"> = {
    0: "weak",
    1: "weak",
    2: "fair",
    3: "good",
    4: "strong",
  };

  return { score, label: labels[score] };
}

/**
 * Sanitizes text input to prevent XSS
 * Removes or escapes potentially dangerous characters
 */
export function sanitizeText(text: string): string {
  if (!text) return "";

  return text
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Validates phone number format (flexible for international)
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || phone.trim() === "") return true; // Empty is valid (optional)

  // Allow digits, spaces, dashes, parentheses, and plus sign
  const phonePattern = /^[\d\s\-\(\)\+]+$/;
  const digitsOnly = phone.replace(/\D/g, "");

  // Must have between 7 and 15 digits
  return phonePattern.test(phone) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
}
