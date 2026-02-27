import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Escape HTML special characters to prevent injection in templates
export function escapeHtml(input: string | undefined | null): string {
  if (!input) return ''
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Simple same-origin return URL check for client redirects
export function isSafeReturnUrl(url: string | null | undefined): boolean {
  if (!url) return false
  // Only allow relative paths starting with a single '/'
  return /^\/[\w\-./?=&%#]*$/.test(url) && !url.startsWith('//')
}
