import { supabaseAdmin } from "@/lib/supabase/client"
import { validateId, sanitizeString } from "@/lib/security/validation"
import readingTime from "reading-time"

// ── Types ─────────────────────────────────────────────────────────────────
export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string | null
  author: string
  status: "draft" | "published"
  tags: string[]
  meta_title: string | null
  meta_description: string | null
  reading_time: number
  views: number
  created_at: string
  updated_at: string
}

export interface BlogPostInput {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image?: string | null
  author?: string
  status?: "draft" | "published"
  tags?: string[]
  meta_title?: string | null
  meta_description?: string | null
}

// ── Get all published posts (public) ──────────────────────────────────────
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, author, status, tags, reading_time, views, created_at, updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[blog] getPublishedPosts error:", error)
    throw error
  }

  return (data || []) as BlogPost[]
}

// ── Get all posts (admin) ──────────────────────────────────────────────────
export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[blog] getAllPosts error:", error)
    throw error
  }

  return (data || []) as BlogPost[]
}

// ── Get post by slug (public) ──────────────────────────────────────────────
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!slug || typeof slug !== "string") return null

  const safeSlug = slug.trim().toLowerCase().slice(0, 200)

  const { data, error } = await (supabaseAdmin as any)
    .from("blog_posts")
    .select("*")
    .eq("slug", safeSlug)
    .eq("status", "published")
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("[blog] getPostBySlug error:", error)
    throw error
  }

  return (data || null) as BlogPost | null
}

// ── Get post by ID (admin) ─────────────────────────────────────────────────
export async function getPostById(id: number): Promise<BlogPost | null> {
  const safeId = validateId(id)
  if (!safeId) throw new Error("Invalid post id")

  const { data, error } = await (supabaseAdmin as any)
    .from("blog_posts")
    .select("*")
    .eq("id", safeId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("[blog] getPostById error:", error)
    throw error
  }

  return (data || null) as BlogPost | null
}

// ── Create post (admin) ────────────────────────────────────────────────────
export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const stats = readingTime(input.content)

  const { data, error } = await (supabaseAdmin as any)
    .from("blog_posts")
    .insert({
      title: sanitizeString(input.title, 200),
      slug: input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 200),
      excerpt: sanitizeString(input.excerpt, 500),
      content: input.content,
      cover_image: input.cover_image || null,
      author: sanitizeString(input.author || "Qyantra Team", 100),
      status: input.status || "draft",
      tags: (input.tags || []).map(t => sanitizeString(t, 50)).slice(0, 10),
      meta_title: input.meta_title ? sanitizeString(input.meta_title, 200) : null,
      meta_description: input.meta_description ? sanitizeString(input.meta_description, 500) : null,
      reading_time: Math.ceil(stats.minutes),
    })
    .select()
    .single()

  if (error) {
    console.error("[blog] createPost error:", error)
    throw error
  }

  return data as BlogPost
}

// ── Update post (admin) ────────────────────────────────────────────────────
export async function updatePost(id: number, input: Partial<BlogPostInput>): Promise<BlogPost> {
  const safeId = validateId(id)
  if (!safeId) throw new Error("Invalid post id")

  const updates: Record<string, any> = {}

  if (input.title) updates.title = sanitizeString(input.title, 200)
  if (input.slug) updates.slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 200)
  if (input.excerpt) updates.excerpt = sanitizeString(input.excerpt, 500)
  if (input.content) {
    updates.content = input.content
    const stats = readingTime(input.content)
    updates.reading_time = Math.ceil(stats.minutes)
  }
  if (input.cover_image !== undefined) updates.cover_image = input.cover_image
  if (input.author) updates.author = sanitizeString(input.author, 100)
  if (input.status) updates.status = input.status
  if (input.tags) updates.tags = input.tags.map(t => sanitizeString(t, 50)).slice(0, 10)
  if (input.meta_title !== undefined) updates.meta_title = input.meta_title ? sanitizeString(input.meta_title, 200) : null
  if (input.meta_description !== undefined) updates.meta_description = input.meta_description ? sanitizeString(input.meta_description, 500) : null

  const { data, error } = await (supabaseAdmin as any)
    .from("blog_posts")
    .update(updates)
    .eq("id", safeId)
    .select()
    .single()

  if (error) {
    console.error("[blog] updatePost error:", error)
    throw error
  }

  return data as BlogPost
}

// ── Delete post (admin) ────────────────────────────────────────────────────
export async function deletePost(id: number): Promise<void> {
  const safeId = validateId(id)
  if (!safeId) throw new Error("Invalid post id")

  const { error } = await (supabaseAdmin as any)
    .from("blog_posts")
    .delete()
    .eq("id", safeId)

  if (error) {
    console.error("[blog] deletePost error:", error)
    throw error
  }
}

// ── Increment views ────────────────────────────────────────────────────────
export async function incrementViews(slug: string): Promise<void> {
  await (supabaseAdmin as any).rpc("increment_blog_views", { post_slug: slug })
}