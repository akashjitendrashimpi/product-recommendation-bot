import { NextRequest, NextResponse } from "next/server"
import { getSession, validateCSRF } from "@/lib/auth/session"
import { getAllPosts, createPost } from "@/lib/db/blog"
import { rateLimit } from "@/lib/security/rate-limit"
import { sanitizeString, hasSqlInjection, hasXssPatterns } from "@/lib/security/validation"
import slugify from "slugify"

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const posts = await getAllPosts()
    return NextResponse.json({ posts, total: posts.length })
  } catch (error) {
    console.error("[admin/blog/GET] Error:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!validateCSRF(request)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
    }

    const rateLimitRes = rateLimit(request, 10, 60_000)
    if (rateLimitRes) return rateLimitRes

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const {
      title, excerpt, content, cover_image,
      author, status, tags, meta_title, meta_description
    } = body as Record<string, any>

    // Validate required fields
    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 })
    if (!content?.trim()) return NextResponse.json({ error: "Content is required" }, { status: 400 })
    if (!excerpt?.trim()) return NextResponse.json({ error: "Excerpt is required" }, { status: 400 })

    // Security checks
    if (hasSqlInjection(title) || hasXssPatterns(title)) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 })
    }

    // Generate slug from title
    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    })

    const post = await createPost({
      title: sanitizeString(title, 200),
      slug,
      excerpt: sanitizeString(excerpt, 500),
      content,
      cover_image: cover_image || null,
      author: author || "Qyantra Team",
      status: status === "published" ? "published" : "draft",
      tags: Array.isArray(tags) ? tags : [],
      meta_title: meta_title || null,
      meta_description: meta_description || null,
    })

    return NextResponse.json({ post, success: true }, { status: 201 })
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json({ error: "A post with this title already exists" }, { status: 409 })
    }
    console.error("[admin/blog/POST] Error:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}