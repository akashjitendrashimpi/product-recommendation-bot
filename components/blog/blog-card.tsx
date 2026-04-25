import Link from "next/link"
import { Clock, Eye, Tag, ArrowRight } from "lucide-react"
import type { BlogPost } from "@/lib/db/blog"

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`}>
        <article className="group relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-white overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

          <div className="relative">
            {/* Featured badge */}
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              ⭐ Featured Post
            </span>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs bg-white/15 text-white/90 px-2.5 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight group-hover:text-blue-100 transition-colors">
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="text-white/80 text-sm leading-relaxed mb-6 line-clamp-2">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-white/70 text-xs">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.reading_time} min read
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {post.views.toLocaleString()} views
                </span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1 text-white font-bold text-sm group-hover:gap-2 transition-all">
                Read more <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden h-full flex flex-col">
        {/* Cover image placeholder */}
        <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl select-none">
              {post.tags[0] === "earning" ? "💰" :
               post.tags[0] === "tips" ? "💡" :
               post.tags[0] === "apps" ? "📱" :
               post.tags[0] === "upi" ? "💳" : "✍️"}
            </div>
          )}
          {/* Reading time badge */}
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Clock className="w-3 h-3" />
            {post.reading_time} min
          </span>
        </div>

        <div className="p-5 flex flex-col flex-1">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-base font-black text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{formattedDate}</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.views.toLocaleString()}
              </span>
            </div>
            <span className="text-xs text-blue-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
              Read <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}