import { NextRequest, NextResponse } from "next/server"
import { getPublishedPosts } from "@/lib/db/blog"
import { rateLimit } from "@/lib/security/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const rateLimitRes = rateLimit(request, 30, 60_000)
    if (rateLimitRes) return rateLimitRes

    const posts = await getPublishedPosts()

    return NextResponse.json(
      { posts, total: posts.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (error) {
    console.error("[blog/GET] Error:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}