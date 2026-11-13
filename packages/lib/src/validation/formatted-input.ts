export const PINCODE_MAX_LENGTH = 6;
export const PAN_MAX_LENGTH = 10;
export const TAN_MAX_LENGTH = 10;
export const GSTIN_MAX_LENGTH = 15;

export const PINCODE_REGEX = /^\d{6}$/;
export const INDIAN_MOBILE_REGEX = /^\d{10}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const TAN_REGEX = /^[A-Z]{4}[0-9]{5}[A-Z]$/;
export const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
/**
 * Local@domain with at least one dot in the domain.
 * Rejects spaces, missing `@`, and consecutive / leading / trailing dots.
 */
export const EMAIL_REGEX =
  /^[^\s@.]+(?:\.[^\s@.]+)*@[^\s@.]+(?:\.[^\s@.]+)+$/;
/** Hostname with ≥1 dot, no trailing dot; TLD letters ≥2 chars */
export const WEBSITE_HOSTNAME_REGEX =
  /^(?=.{1,253}$)(?!-)[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

export function isValidWebsiteUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  let url: URL;
  try {
    url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  // WHATWG URL treats user@host as credentials; reject email-like / credentialed URLs.
  if (url.username || url.password) return false;
  return WEBSITE_HOSTNAME_REGEX.test(url.hostname);
}

export function normalizePincodeInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, PINCODE_MAX_LENGTH);
}

export function normalizePanInput(value: string): string {
  const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  let result = "";
  for (const char of chars) {
    const index = result.length;
    if (index >= PAN_MAX_LENGTH) break;
    if (index < 5) {
      if (/[A-Z]/.test(char)) result += char;
    } else if (index < 9) {
      if (/[0-9]/.test(char)) result += char;
    } else if (/[A-Z]/.test(char)) {
      result += char;
    }
  }
  return result;
}

export function normalizeTanInput(value: string): string {
  const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  let result = "";
  for (const char of chars) {
    const index = result.length;
    if (index >= TAN_MAX_LENGTH) break;
    if (index < 4) {
      if (/[A-Z]/.test(char)) result += char;
    } else if (index < 9) {
      if (/[0-9]/.test(char)) result += char;
    } else if (/[A-Z]/.test(char)) {
      result += char;
    }
  }
  return result;
}

export function normalizeGstinInput(value: string): string {
  const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  let result = "";
  for (const char of chars) {
    const index = result.length;
    if (index >= GSTIN_MAX_LENGTH) break;
    if (index < 2) {
      if (/[0-9]/.test(char)) result += char;
    } else if (index < 7) {
      if (/[A-Z]/.test(char)) result += char;
    } else if (index < 11) {
      if (/[0-9]/.test(char)) result += char;
    } else if (index === 11) {
      if (/[A-Z]/.test(char)) result += char;
    } else if (index === 12) {
      if (/[1-9A-Z]/.test(char)) result += char;
    } else if (index === 13) {
      if (char === "Z") result += char;
    } else if (/[0-9A-Z]/.test(char)) {
      result += char;
    }
  }
  return result;
}

export function normalizeIndianMobileInput(value: string): string {
  // Digits only — do not strip +91 / truncate; validation rejects invalid lengths.
  return value.replace(/\D/g, "");
}

/** Trim + lowercase for consistent email storage and comparison. */
export function normalizeEmailInput(value: string): string {
  return value.trim().toLowerCase();
}
