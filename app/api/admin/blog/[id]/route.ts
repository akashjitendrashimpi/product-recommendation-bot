import { NextRequest, NextResponse } from "next/server"
import { getSession, validateCSRF } from "@/lib/auth/session"
import { getPostById, updatePost, deletePost } from "@/lib/db/blog"
import { validateId, sanitizeString } from "@/lib/security/validation"
import { rateLimit } from "@/lib/security/rate-limit"
import slugify from "slugify"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = validateId(rawId)
    if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const post = await getPostById(id)
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

    return NextResponse.json({ post })
  } catch (error) {
    console.error("[admin/blog/id/GET] Error:", error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params)
}

async function handleUpdate(
  request: NextRequest,
  paramsPromise: Promise<{ id: string }>
) {
  try {
    const { id: rawId } = await paramsPromise
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!validateCSRF(request)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
    }

    const rateLimitRes = rateLimit(request, 20, 60_000)
    if (rateLimitRes) return rateLimitRes

    const id = validateId(rawId)
    if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

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

    const updates: Record<string, any> = {}
    if (title) {
      updates.title = sanitizeString(title, 200)
      updates.slug = slugify(title, { lower: true, strict: true, trim: true })
    }
    if (excerpt) updates.excerpt = sanitizeString(excerpt, 500)
    if (content) updates.content = content
    if (cover_image !== undefined) updates.cover_image = cover_image
    if (author) updates.author = sanitizeString(author, 100)
    if (status) updates.status = status === "published" ? "published" : "draft"
    if (tags) updates.tags = Array.isArray(tags) ? tags : []
    if (meta_title !== undefined) updates.meta_title = meta_title
    if (meta_description !== undefined) updates.meta_description = meta_description

    const post = await updatePost(id, updates)
    return NextResponse.json({ post, success: true })
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json({ error: "A post with this title already exists" }, { status: 409 })
    }
    console.error("[admin/blog/id/UPDATE] Error:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!validateCSRF(request)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
    }

    const id = validateId(rawId)
    if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    await deletePost(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin/blog/id/DELETE] Error:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}