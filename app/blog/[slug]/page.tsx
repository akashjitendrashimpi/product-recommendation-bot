import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Sparkles, ArrowLeft, Clock, Eye, Calendar, Tag, ArrowRight } from "lucide-react"
import { getPostBySlug, getPublishedPosts } from "@/lib/db/blog"
import { MDXRemote } from "next-mdx-remote/rsc"

export const revalidate = 300

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: "Post Not Found" }
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
  }
}

export default async function BlogPostPage(
  { params }: { params: { slug: string } }
) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const formattedDate = new Date(post.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-white">
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
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            Start Earning Free
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>

        <p className="text-lg text-gray-500 leading-relaxed mb-6 border-l-4 border-blue-500 pl-4">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100">
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
        </div>

        {post.cover_image && (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-64 object-cover rounded-2xl mb-8 shadow-sm"
          />
        )}

        <article className="blog-content prose prose-gray max-w-none">
          <MDXRemote source={post.content} />
        </article>

        <div className="mt-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-center text-white">
          <h2 className="text-xl font-black mb-2">Start Earning Today!</h2>
          <p className="text-blue-100 mb-5 text-sm">Join Qyantra and earn real money completing simple tasks</p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-black px-6 py-3 rounded-2xl hover:bg-blue-50 transition-colors"
          >
            Join Free Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 flex items-center gap-3 justify-center flex-wrap">
          <p className="text-sm text-gray-400 font-medium">Share this post:</p>
          <a
            href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(post.title) + "&url=" + encodeURIComponent("https://www.qyantra.online/blog/" + post.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-xl font-semibold transition-colors"
          >
            Twitter/X
          </a>
          <a
            href={"https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent("https://www.qyantra.online/blog/" + post.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-xl font-semibold transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={"https://wa.me/?text=" + encodeURIComponent(post.title + " - https://www.qyantra.online/blog/" + post.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-xl font-semibold transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-16 py-6 px-4 text-center text-sm text-gray-400">
        <p>
          {"\u00A9"} 2026 Qyantra {"\u00B7"}{" "}
          <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
          {" \u00B7 "}
          <Link href="/terms" className="hover:text-gray-600">Terms</Link>
          {" \u00B7 "}
          <Link href="/blog" className="hover:text-gray-600">Blog</Link>
        </p>
      </footer>
    </div>
  )
}
