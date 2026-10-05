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
export function validateFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".docx"];

  // Check size
  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File size must be under 5MB" };
  }

  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Only PDF, TXT, and DOCX files are allowed",
    };
  }

  // Check extension
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: "Invalid file extension",
    };
  }

  // Content-type virus scan simulation: check for suspicious patterns
  if (file.type !== ALLOWED_TYPES[ALLOWED_EXTENSIONS.indexOf(ext)]) {
    return {
      valid: false,
      error: "File type mismatch — possible security risk",
    };
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
