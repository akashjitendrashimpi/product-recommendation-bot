import readingTime from "reading-time"

export interface BlogPost {
  id: number
  title: string
  content: string
  excerpt: string
  slug: string
  author: string
  tags: string[]
  cover_image?: string | null
  status: "draft" | "published"
  created_at: string
  updated_at: string
}

/**
 * Calculate reading time for blog post
 */
export function getReadingTime(content: string): string {
  const plainText = stripHTML(content)
  const stats = readingTime(plainText)
  return stats.text
}

/**
 * Strip HTML tags from content
 */
export function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, length: number = 150): string {
  const plainText = stripHTML(content)
  if (plainText.length <= length) return plainText
  return plainText.substring(0, length).trim() + "..."
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
}

/**
 * Search blog posts
 */
export function searchPosts(posts: BlogPost[], query: string): BlogPost[] {
  if (!query.trim()) return posts

  const lowerQuery = query.toLowerCase()
  return posts.filter(post =>
    post.title.toLowerCase().includes(lowerQuery) ||
    post.excerpt.toLowerCase().includes(lowerQuery) ||
    post.content.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Filter posts by tag
 */
export function filterByTag(posts: BlogPost[], tag: string): BlogPost[] {
  return posts.filter(post => post.tags.includes(tag))
}

/**
 * Filter posts by author
 */
export function filterByAuthor(posts: BlogPost[], author: string): BlogPost[] {
  return posts.filter(post => post.author.toLowerCase() === author.toLowerCase())
}

/**
 * Sort posts by date
 */
export function sortByDate(posts: BlogPost[], order: "asc" | "desc" = "desc"): BlogPost[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return order === "asc" ? dateA - dateB : dateB - dateA
  })
}

/**
 * Get all unique tags from posts
 */
export function getAllTags(posts: BlogPost[]): string[] {
  const tags = new Set<string>()
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

/**
 * Get social share URLs
 */
export interface ShareUrls {
  twitter: string
  linkedin: string
  facebook: string
  whatsapp: string
  email: string
}

export function getSocialShareUrls(post: BlogPost, baseUrl: string): ShareUrls {
  const url = `${baseUrl}/blog/${post.slug}`
  const title = encodeURIComponent(post.title)
  const description = encodeURIComponent(post.excerpt)

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${title}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${title}%20${encodeURIComponent(url)}`,
    email: `mailto:?subject=${title}&body=${description}%20${encodeURIComponent(url)}`
  }
}

/**
 * Get related posts based on tags
 */
export function getRelatedPosts(post: BlogPost, allPosts: BlogPost[], limit: number = 3): BlogPost[] {
  return allPosts
    .filter(p => p.id !== post.id && p.status === "published")
    .map(p => ({
      post: p,
      score: p.tags.filter(tag => post.tags.includes(tag)).length
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post)
}

/**
 * Generate table of contents from content
 */
export interface TOCItem {
  level: number
  text: string
  id: string
}

export function generateTableOfContents(html: string): TOCItem[] {
  const toc: TOCItem[] = []
  const regex = /<h([1-6])(?:[^>]*)>([^<]*)<\/h\1>/g
  let match

  const usedIds = new Set<string>()

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const text = stripHTML(match[2])
    let id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")

    // Ensure unique IDs
    let counter = 1
    const originalId = id
    while (usedIds.has(id)) {
      id = `${originalId}-${counter}`
      counter++
    }
    usedIds.add(id)

    toc.push({ level, text, id })
  }

  return toc
}

/**
 * Get trending posts (most viewed)
 */
export function getTrendingPosts(posts: BlogPost[], limit: number = 5): BlogPost[] {
  // This would require view tracking in the database
  // For now, return recent posts
  return sortByDate(posts, "desc").slice(0, limit)
}

/**
 * Calculate engagement score
 */
export function calculateEngagementScore(post: BlogPost): number {
  let score = 0

  // Title quality (50 points max)
  if (post.title.length > 30 && post.title.length < 100) score += 50

  // Excerpt quality (30 points max)
  if (post.excerpt.length > 50 && post.excerpt.length < 300) score += 30

  // Content depth (20 points max)
  const wordCount = post.content.split(/\s+/).length
  if (wordCount > 500) score += 20

  // Tags (bonus 20 points max)
  if (post.tags.length >= 3 && post.tags.length <= 8) score += 20

  // Has image (10 points)
  if (post.cover_image) score += 10

  return Math.min(score, 100)
}
