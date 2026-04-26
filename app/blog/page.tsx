import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, ArrowRight, BookOpen, TrendingUp } from "lucide-react"
import { getPublishedPosts } from "@/lib/db/blog"
import { BlogCard } from "@/components/blog/blog-card"
import { BlogPageClient } from "@/components/blog/blog-page-client"

export const metadata: Metadata = {
  title: "Blog — Earn Money Tips & Guides",
  description: "Learn how to earn real money online in India. Tips, guides and strategies for maximizing your earnings on Qyantra.",
  alternates: { canonical: "https://www.qyantra.online/blog" },
  openGraph: {
    title: "Qyantra Blog — Earn Money Tips & Guides",
    description: "Learn how to earn real money online in India.",
    url: "https://www.qyantra.online/blog",
    siteName: "Qyantra",
    type: "website",
  },
}

export const revalidate = 300 // revalidate every 5 minutes

export default async function BlogPage() {
  const posts = await getPublishedPosts()
  const featuredPost = posts[0]
  const remainingPosts = posts.slice(1)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg text-gray-900">Qyantra</span>
          </Link>
          <Link
            href="/auth/sign-up"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            Start Earning Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Earning Tips & Guides
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Learn to Earn More
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Tips, strategies and guides to maximize your earnings on Qyantra and beyond.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold">No posts yet</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featuredPost && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-bold text-gray-700">Latest Post</p>
                </div>
                <BlogCard post={featuredPost} featured />
              </div>
            )}

            {/* Search, Filter, and All Posts */}
            {remainingPosts.length > 0 && (
              <BlogPageClient posts={remainingPosts} />
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-black mb-2">Ready to Start Earning?</h2>
          <p className="text-blue-100 mb-6 text-sm">Join thousands of Indians earning real money daily</p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-black px-6 py-3 rounded-2xl hover:bg-blue-50 transition-colors"
          >
            Start Free Today <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
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