import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const BASE_URL = "https://www.qyantra.online"

interface SitemapPage {
  url: string
  priority: string
  changefreq: string
  lastmod?: string
}

function buildXml(pages: SitemapPage[]): string {
  const today = new Date().toISOString().split("T")[0]

  const urls = pages
    .map(
      (page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod ?? today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("\n")

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
  const pages: SitemapPage[] = [
    // ── Core public pages ──────────────────────────────────
    {
      url: "/",
      priority: "1.0",
      changefreq: "weekly",
    },
    {
      url: "/auth/sign-up",
      priority: "0.9",
      changefreq: "monthly",
    },
    {
      url: "/auth/login",
      priority: "0.7",
      changefreq: "monthly",
    },
    {
      url: "/contact",
      priority: "0.6",
      changefreq: "monthly",
    },

    // ── Legal ──────────────────────────────────────────────
    {
      url: "/privacy",
      priority: "0.4",
      changefreq: "yearly",
      lastmod: "2026-03-01",
    },
    {
      url: "/terms",
      priority: "0.4",
      changefreq: "yearly",
      lastmod: "2026-03-01",
    },
  ]

  try {
    const xml = buildXml(pages)

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "X-Robots-Tag": "noindex", // sitemap itself shouldn't be indexed
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("[sitemap] Failed to generate sitemap:", error)
    return new NextResponse("Failed to generate sitemap", { status: 500 })
  }
}