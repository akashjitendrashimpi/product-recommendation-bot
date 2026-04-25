import { NextResponse } from "next/server"
import { getPublishedPosts } from "@/lib/db/blog"

export const dynamic = "force-dynamic"

const BASE_URL = "https://www.qyantra.online"

interface SitemapPage {
  url: string
  priority: string
  changefreq: string
  lastmod?: string
  images?: { loc: string; title: string }[]
}

function buildXml(pages: SitemapPage[]): string {
  const today = new Date().toISOString().split("T")[0]

  const urls = pages.map((page) => {
    const images = page.images?.map(img => `
    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${img.title}</image:title>
    </image:image>`).join("") || ""

    return `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod ?? today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${images}
  </url>`
  }).join("\n")
  
  const blogPosts = await getPublishedPosts()
const blogPages: SitemapPage[] = blogPosts.map(post => ({
  url: `/blog/${post.slug}`,
  priority: "0.7",
  changefreq: "weekly",
  lastmod: new Date(post.updated_at).toISOString().split("T")[0],
}))
  
 const allPages: SitemapPage[] = [
  ...pages,
  { url: "/blog", priority: "0.8", changefreq: "daily" },
  ...blogPages,
]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xsi:schemaLocation="
    http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`
}

export async function GET() {
  try {
    const pages: SitemapPage[] = [
      // ── Highest priority — homepage ──────────────────────────────────
      {
        url: "/",
        priority: "1.0",
        changefreq: "weekly",
        images: [
          {
            loc: `${BASE_URL}/web-app-manifest-512x512.png`,
            title: "Qyantra — Earn Real Money Daily with UPI Payout",
          },
        ],
      },

      // ── Legal — low priority, yearly ──────────────────────────────────
      {
        url: "/privacy",
        priority: "0.3",
        changefreq: "yearly",
        lastmod: "2026-03-01",
      },
      {
        url: "/terms",
        priority: "0.3",
        changefreq: "yearly",
        lastmod: "2026-03-01",
      },
      {
        url: "/contact",
        priority: "0.4",
        changefreq: "yearly",
      },
    ]

    const xml = buildXml(pages)

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "X-Robots-Tag": "noindex",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("[sitemap] Failed to generate sitemap:", error)
    return new NextResponse("Failed to generate sitemap", { status: 500 })
  }
}