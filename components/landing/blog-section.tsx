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
      className="py-20 sm:py-28 px-4 bg-white relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -right-24 w-72 h-72 bg-purple-50/50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-5 border border-blue-100 shadow-sm">
              <BookOpen className="w-3.5 h-3.5" aria-hidden />
              Knowledge Hub
            </div>
            <h2
              id="blog-heading"
              className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight"
            >
              Master the Art of <span className="text-blue-600">Earning</span>
            </h2>
            <p className="text-gray-500 mt-4 text-lg font-medium leading-relaxed">
              Expert guides, case studies, and proven strategies to maximize your daily revenue streams.
            </p>
          </div>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2.5 text-sm font-black text-blue-600 hover:text-blue-700 transition-all flex-shrink-0 active:scale-95"
            aria-label="View all blog posts"
          >
            <span>Explore All Insights</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
              <ArrowRight className="w-4 h-4" aria-hidden />
            </div>
          </Link>
        </div>

        {/* Featured + Side layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Featured post — large */}
          {featured && (
            <Link
              href={"/blog/" + safeStr(featured.slug)}
              className="lg:col-span-3 group bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5 hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden flex flex-col hover:-translate-y-1"
              aria-label={"Read featured: " + safeStr(featured.title, 200)}
            >
              {/* Cover */}
              <div className="relative h-64 sm:h-80 overflow-hidden flex-shrink-0">
                {featured.cover_image ? (
                  <img
                    src={safeStr(featured.cover_image, 500)}
                    alt={safeStr(featured.title, 200)}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                ) : (
                  <div className={"w-full h-full bg-gradient-to-br " + getGradient(0) + " flex items-center justify-center"}>
                    <span className="text-8xl select-none transform group-hover:scale-110 transition-transform duration-500" aria-hidden>
                      {getPostEmoji(featured.tags)}
                    </span>
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl shadow-xl">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" aria-hidden />
                    Leading Story
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  <span className="inline-flex items-center gap-2 text-white/90 text-xs font-bold bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                    <Clock className="w-3.5 h-3.5" aria-hidden />
                    {featured.reading_time} min read
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 sm:p-10 flex flex-col flex-1">
                <div className="flex flex-wrap gap-2 mb-6">
                  {featured.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-600"
                    >
                      # {safeStr(tag, 30)}
                    </span>
                  ))}
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 leading-[1.2] mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {safeStr(featured.title, 200)}
                </h3>

                <p className="text-gray-500 leading-relaxed line-clamp-3 mb-8 text-lg font-medium">
                  {safeStr(featured.excerpt, 300)}
                </p>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-200">
                      {safeStr(featured.author, 1).toUpperCase() || "Q"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-gray-900 uppercase tracking-tight">
                        {safeStr(featured.author, 50)}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Expert</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-5 h-5" aria-hidden />
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Side posts — small */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {rest.map((post, idx) => (
              <Link
                key={post.id}
                href={"/blog/" + safeStr(post.slug)}
                className="group bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden flex gap-5 p-6 hover:-translate-y-1"
                aria-label={"Read: " + safeStr(post.title, 200)}
              >
                {/* Thumbnail */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden flex-shrink-0 shadow-inner">
                  {post.cover_image ? (
                    <img
                      src={safeStr(post.cover_image, 500)}
                      alt={safeStr(post.title, 200)}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className={"w-full h-full bg-gradient-to-br " + getGradient(idx + 1) + " flex items-center justify-center"}>
                      <span className="text-4xl select-none transform group-hover:scale-110 transition-transform duration-500" aria-hidden>
                        {getPostEmoji(post.tags)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  {post.tags.length > 0 && (
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">
                      {safeStr(post.tags[0], 20)}
                    </span>
                  )}

                  <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
                    {safeStr(post.title, 200)}
                  </h3>

                  <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-300" aria-hidden />
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
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-8 text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-black/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -translate-y-16 translate-x-16" aria-hidden />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">
                  Growth Opportunity
                </p>
                <h3 className="text-2xl font-black leading-[1.1] mb-3">
                  Why wait to <br/> be <span className="text-blue-500 text-3xl">Rich?</span>
                </h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                  Join 100,000+ Indians monetizing their free time daily.
                </p>
              </div>
              <Link
                href="/auth/sign-up"
                className="relative z-10 inline-flex items-center gap-3 bg-white text-black font-black text-sm px-6 py-4 rounded-2xl hover:bg-blue-50 transition-all w-full justify-center active:scale-95 shadow-xl"
              >
                Start Earning Now <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}