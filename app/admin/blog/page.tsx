import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getAllPosts } from "@/lib/db/blog"
import { DeleteButton } from "@/components/blog/delete-button"
import Link from "next/link"
import {
  Plus, Eye, Edit, Trash2, FileText,
  CheckCircle2, Clock, BarChart3, BookOpen
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminBlogPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect("/auth/login")

  const posts = await getAllPosts()

  const published = posts.filter(p => p.status === "published").length
  const drafts = posts.filter(p => p.status === "draft").length
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0)

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your blog content</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 sm:py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Posts", value: posts.length, icon: BookOpen, color: "blue" },
          { label: "Published", value: published, icon: CheckCircle2, color: "green" },
          { label: "Drafts", value: drafts, icon: Clock, color: "orange" },
          { label: "Total Views", value: totalViews.toLocaleString(), icon: BarChart3, color: "purple" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-semibold mb-2">No posts yet</p>
          <p className="text-gray-400 text-sm mb-6">Create your first blog post to get started</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile Card List (Hidden on sm and up) */}
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 line-clamp-2 leading-snug">{post.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {post.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {post.views}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/admin/blog/${post.id}/edit`} className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Edit className="w-4 h-4" />
                    </Link>
                    {post.status === "published" && (
                      <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 bg-gray-50 text-gray-600 rounded-xl">
                        <Eye className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table (Hidden on mobile) */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest px-6 py-4">Title</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-4 hidden sm:table-cell">Status</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-4 hidden md:table-cell">Views</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-4 hidden lg:table-cell">Date</th>
                  <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-widest px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, i) => (
                  <tr key={post.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i === posts.length - 1 ? "border-0" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm font-bold text-gray-900 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{post.excerpt}</p>
                        {post.tags.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:table-cell">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {post.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        {post.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-400">
                        {new Date(post.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === "published" && (
                          <Link
                            href={"/blog/" + post.slug}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            title="View post"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit post"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
