import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Sparkles, ArrowLeft, Clock, Eye, Calendar, ArrowRight } from "lucide-react"
import { getPostBySlug, incrementViews, getPublishedPosts } from "@/lib/db/blog"
import { serialize } from "next-mdx-remote/serialize"
import { BlogShare } from "@/components/blog/blog-share"
import { BlogPostClient } from "@/components/blog/blog-post-client"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: "Post Not Found" }
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    alternates: { canonical: `https://www.qyantra.online/blog/${post.slug}` },
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      url: `https://www.qyantra.online/blog/${post.slug}`,
      type: "article",
      images: post.cover_image ? [{ url: post.cover_image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
    },
  }
}

export const dynamic = "force-dynamic"

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  // Increment views
  await incrementViews(slug).catch(() => {})

  // Fetch more posts for "More from Blog"
  const allPosts = await getPublishedPosts()
  const morePosts = allPosts.filter(p => p.slug !== slug).slice(0, 2)

  const mdxSource = await serialize(post.content, {
    mdxOptions: {
      development: process.env.NODE_ENV === "development",
    },
  })

  const formattedDate = new Date(post.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  })

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.meta_description || post.excerpt,
    "image": post.cover_image || "",
    "author": {
      "@type": "Organization",
      "name": "Qyantra Team",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Qyantra",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.qyantra.online/logo.png"
      }
    },
    "datePublished": post.created_at,
    "dateModified": post.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.qyantra.online/blog/${post.slug}`
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg text-gray-900">Qyantra</span>
          </Link>
          <Link href="/auth/sign-up" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
            Start Earning Free
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Blog
        </Link>

        {/* Cover image */}
        {post.cover_image && (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-64 sm:h-80 object-cover rounded-3xl mb-8 shadow-sm"
          />
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>

        {/* Meta & Share */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.reading_time} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {post.views.toLocaleString()} views
            </span>
            <span className="font-medium text-gray-600">By {post.author}</span>
          </div>
          <BlogShare post={post} baseUrl="https://www.qyantra.online" />
        </div>

        {/* Client Component for TOC and Content */}
        <BlogPostClient post={post} mdxSource={mdxSource} />

        {/* More from Blog */}
        {morePosts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Continue Reading</h3>
              <Link href="/blog" className="text-[10px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 group uppercase tracking-widest">
                Full Catalog <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {morePosts.map(p => (
                <Link 
                  key={p.id} 
                  href={`/blog/${p.slug}`}
                  className="group block"
                >
                  <div className="aspect-[16/10] rounded-[1.5rem] overflow-hidden mb-4 bg-gray-50 border border-gray-100 shadow-sm group-hover:shadow-blue-500/10 transition-all">
                    {p.cover_image && (
                      <img 
                        src={p.cover_image} 
                        alt={p.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>
                  <h4 className="text-lg font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                    {p.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-black mb-2">Start Earning Today</h2>
          <p className="text-blue-100 mb-6 text-sm">Join thousands of Indians earning real money daily on Qyantra</p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-black px-6 py-3 rounded-2xl hover:bg-blue-50 transition-colors"
          >
            Create Free Account →
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-16 py-6 px-4 text-center text-sm text-gray-400">
        <p>© 2026 Qyantra ·
          <Link href="/privacy" className="hover:text-gray-600 ml-1">Privacy</Link> ·
          <Link href="/terms" className="hover:text-gray-600 ml-1">Terms</Link> ·
          <Link href="/blog" className="hover:text-gray-600 ml-1">Blog</Link>
        </p>
      </footer>
    </div>
  )
}