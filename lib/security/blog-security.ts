import DOMPurify from "dompurify"

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  if (typeof window === "undefined") {
    return html // Return as-is on server-side
  }

  const config = {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
      "img", "video", "iframe", "table", "thead", "tbody", "tr", "td", "th"
    ],
    ALLOWED_ATTR: [
      "href", "title", "alt", "src", "width", "height", "target", "rel",
      "data-href", "class"
    ],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
  }

  return DOMPurify.sanitize(html, config)
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  if (typeof window === "undefined") return ""
  const token = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  sessionStorage.setItem("csrf-token", token)
  return token
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  if (typeof window === "undefined") return false
  const storedToken = sessionStorage.getItem("csrf-token")
  return storedToken === token
}

/**
 * Sanitize user input (prevent script injection)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim()
    .substring(0, 1000) // Limit length
}

/**
 * Validate blog post data
 */
export function validateBlogPost(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Title is required")
  } else if (data.title.length > 200) {
    errors.push("Title must be less than 200 characters")
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push("Content is required")
  } else if (data.content.length < 100) {
    errors.push("Content must be at least 100 characters")
  }

  if (!data.excerpt || data.excerpt.trim().length === 0) {
    errors.push("Excerpt is required")
  } else if (data.excerpt.length > 300) {
    errors.push("Excerpt must be less than 300 characters")
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push("Tags must be an array")
  } else if (data.tags && data.tags.length > 10) {
    errors.push("Maximum 10 tags allowed")
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Check rate limit (client-side)
 */
export function checkRateLimit(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now()
  const storagePath = `rate-limit-${key}`
  const stored = localStorage.getItem(storagePath)

  let requests = stored ? JSON.parse(stored) : []
  requests = requests.filter((time: number) => now - time < windowMs)

  if (requests.length >= maxRequests) {
    return false
  }

  requests.push(now)
  localStorage.setItem(storagePath, JSON.stringify(requests))
  return true
}

/**
 * Escape user-generated content for safe display
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
