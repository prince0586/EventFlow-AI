import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes efficiently.
 * Combines clsx for conditional classes and tailwind-merge to prevent conflicts.
 * 
 * @param inputs - List of class values to be merged.
 * @returns A string of merged Tailwind CSS classes.
 * @example
 * cn('p-4', isHovered && 'bg-brand')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a duration in minutes into a human-readable string.
 * 
 * @param minutes - The duration in minutes.
 * @returns A formatted string (e.g., "14m", "1h 5m").
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

/**
 * Formats a timestamp into a high-fidelity operational time string.
 * 
 * @param isoString - ISO 8601 timestamp.
 * @returns A formatted time string (e.g., "14:23:45").
 */
export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour12: false });
  } catch {
    return '--:--:--';
  }
}
