import { NextRequest, NextResponse } from "next/server"
import { getPostBySlug, incrementViews } from "@/lib/db/blog"
import { rateLimit } from "@/lib/security/rate-limit"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params
    const rateLimitRes = rateLimit(request, 30, 60_000)
    if (rateLimitRes) return rateLimitRes

    const slug = rawSlug?.trim().toLowerCase()
    if (!slug || slug.length > 200) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
    }

    const post = await getPostBySlug(slug)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Increment views in background
    incrementViews(slug).catch(console.error)

    return NextResponse.json(
      { post },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (error) {
    console.error("[blog/slug/GET] Error:", error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}