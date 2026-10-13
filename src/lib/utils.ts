import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize user input to prevent XSS.
 * Strips HTML tags and trims whitespace.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .trim();
}

/**
 * Validate file for upload security.
 * Checks file type, size, and performs content-type verification.
 */
export function validateFile(file: File, maxSize = 10 * 1024 * 1024): {
  valid: boolean;
  error?: string;
} {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".docx"];

  // Check extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: "Only PDF, TXT, and DOCX files are allowed",
    };
  }

  // Check size
  if (file.size > maxSize) {
    return { valid: false, error: `File size must be ${Math.floor(maxSize / 1024 / 1024)}MB or smaller` };
  }

  // Verify MIME type if present (accept common browser variants)
  const MIME_MAP: Record<string, string[]> = {
    ".pdf": ["application/pdf", "application/x-pdf", "application/acrobat", "applications/vnd.pdf", "text/pdf"],
    ".txt": ["text/plain", "text/markdown", "text/csv", "application/octet-stream"],
    ".docx": [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/zip",
      "application/x-zip-compressed",
      "application/octet-stream",
    ],
  };

  if (file.type && file.type !== "") {
    const validMimes = MIME_MAP[ext] || [];
    if (!validMimes.includes(file.type) && !file.type.startsWith("text/")) {
      return {
        valid: false,
        error: `File type mismatch for ${ext} (got ${file.type})`,
      };
    }
  }

  return { valid: true };
}

/** Generate a short, readable ID */
export function generateId(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    id += chars[array[i] % chars.length];
  }
  return id;
}

/** Format a date to a readable string */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Format a date to a relative string (e.g., "2 hours ago") */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(new Date(date).toISOString());
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
}

/** Truncate text to a given length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/** Calculate byte size of a string in UTF-8 */
export function getStringSize(str: string): number {
  return new TextEncoder().encode(str).length;
}

/** Format bytes into human readable string */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
