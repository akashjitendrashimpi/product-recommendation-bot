import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getAllPosts } from "@/lib/db/blog"
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your blog content</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Posts", value: posts.length, icon: BookOpen, color: "blue" },
          { label: "Published", value: published, icon: CheckCircle2, color: "green" },
          { label: "Drafts", value: drafts, icon: Clock, color: "orange" },
          { label: "Total Views", value: totalViews.toLocaleString(), icon: BarChart3, color: "purple" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                    <div>
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{post.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.excerpt}</p>
                      {post.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {post.status === "published" ? "Published" : "Draft"}
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
                      <DeleteButton postId={post.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Delete button (client component) ─────────────────────────────────────
function DeleteButton({ postId }: { postId: number }) {
  return (
    <form action={async () => {
      "use server"
      const { getSession } = await import("@/lib/auth/session")
      const session = await getSession()
      if (!session?.isAdmin) return
      const { deletePost } = await import("@/lib/db/blog")
      await deletePost(postId)
      const { revalidatePath } = await import("next/cache")
      revalidatePath("/admin/blog")
    }}>
      <button
        type="submit"
        className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        title="Delete post"
        onClick={(e) => {
          if (!confirm("Are you sure you want to delete this post?")) {
            e.preventDefault()
          }
        }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  )
}