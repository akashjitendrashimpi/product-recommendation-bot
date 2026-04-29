import Link from "next/link"
import { getPublishedPosts } from "@/lib/db/blog"
import { ArrowRight, Clock, TrendingUp, BookOpen } from "lucide-react"

// ── Safe string helper ────────────────────────────────────────────────────
function safeStr(val: unknown, max = 100): string {
  if (typeof val !== "string") return ""
  return val.slice(0, max)
}

// ── Emoji based on tags ───────────────────────────────────────────────────
function getPostEmoji(tags: string[]): string {
  const map: Record<string, string> = {
    earning: "💰", money: "💵", tips: "💡", apps: "📱",
    upi: "💳", india: "🇮🇳", guide: "📖", tasks: "✅",
    survey: "📝", referral: "🤝", payout: "🏦",
  }
  for (const tag of tags) {
    if (map[tag.toLowerCase()]) return map[tag.toLowerCase()]
  }
  return "✍️"
}

// ── Gradient based on index ───────────────────────────────────────────────
function getGradient(idx: number): string {
  const gradients = [
    "from-blue-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-pink-600",
  ]
  return gradients[idx % gradients.length]
}

export async function BlogSection() {
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = []

  try {
    const all = await getPublishedPosts()
    posts = all.slice(0, 3)
  } catch {
    return null
  }

  if (posts.length === 0) return null

  const [featured, ...rest] = posts

  return (
    <section
      id="blog"
      aria-labelledby="blog-heading"
      className="py-16 sm:py-24 px-4 bg-gray-50"
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <BookOpen className="w-3.5 h-3.5" aria-hidden />
              From Our Blog
            </div>
            <h2
              id="blog-heading"
              className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight"
            >
              Tips to Earn More
            </h2>
            <p className="text-gray-500 mt-2 text-sm max-w-md leading-relaxed">
              Practical guides to maximize your daily earnings on Qyantra.
            </p>
          </div>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0"
            aria-label="View all blog posts"
          >
            View all posts
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
          </Link>
        </div>

        {/* Featured + Side layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Featured post — large */}
          {featured && (
            <Link
              href={"/blog/" + safeStr(featured.slug)}
              className="lg:col-span-3 group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col"
              aria-label={"Read: " + safeStr(featured.title, 200)}
            >
              {/* Cover */}
              <div className="relative h-56 sm:h-72 overflow-hidden flex-shrink-0">
                {featured.cover_image ? (
                  <img
                    src={safeStr(featured.cover_image, 500)}
                    alt={safeStr(featured.title, 200)}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className={"w-full h-full bg-gradient-to-br " + getGradient(0) + " flex items-center justify-center"}>
                    <span className="text-7xl select-none" aria-hidden>
                      {getPostEmoji(featured.tags)}
                    </span>
                  </div>
                )}

                {/* Featured badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    <TrendingUp className="w-3 h-3 text-blue-600" aria-hidden />
                    Featured
                  </span>
                </div>

                {/* Reading time */}
                <div className="absolute bottom-4 right-4">
                  <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3" aria-hidden />
                    {featured.reading_time} min
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                {/* Tags */}
                {featured.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featured.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold"
                      >
                        {safeStr(tag, 30)}
                      </span>
                    ))}
                  </div>
                )}

                <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {safeStr(featured.title, 200)}
                </h3>

                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-6 flex-1">
                  {safeStr(featured.excerpt, 300)}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
                      {safeStr(featured.author, 1).toUpperCase() || "Q"}
                    </div>
                    <span className="text-xs font-semibold text-gray-600">
                      {safeStr(featured.author, 50)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Side posts — small */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {rest.map((post, idx) => (
              <Link
                key={post.id}
                href={"/blog/" + safeStr(post.slug)}
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex gap-4 p-5"
                aria-label={"Read: " + safeStr(post.title, 200)}
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  {post.cover_image ? (
                    <img
                      src={safeStr(post.cover_image, 500)}
                      alt={safeStr(post.title, 200)}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className={"w-full h-full bg-gradient-to-br " + getGradient(idx + 1) + " flex items-center justify-center"}>
                      <span className="text-3xl select-none" aria-hidden>
                        {getPostEmoji(post.tags)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col justify-between min-w-0 flex-1">
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold w-fit mb-1">
                      {safeStr(post.tags[0], 20)}
                    </span>
                  )}

                  <h3 className="text-sm font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                    {safeStr(post.title, 200)}
                  </h3>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden />
                      {post.reading_time} min
                    </span>
                    <span>
                      {new Date(post.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* CTA card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 text-white flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">
                  Start Today
                </p>
                <h3 className="text-lg font-black leading-tight mb-2">
                  Ready to earn real money?
                </h3>
                <p className="text-blue-100 text-xs leading-relaxed">
                  Join thousands of Indians earning daily with simple tasks.
                </p>
              </div>
              <Link
                href="/auth/sign-up"
                className="mt-4 inline-flex items-center gap-2 bg-white text-blue-600 font-black text-sm px-4 py-2.5 rounded-2xl hover:bg-blue-50 transition-colors w-fit"
              >
                Join Free <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}