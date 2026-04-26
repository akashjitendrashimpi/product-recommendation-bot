import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { EnhancedBlogEditor } from "@/components/blog/enhanced-blog-editor"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "New Blog Post | Admin",
  robots: { index: false, follow: false },
}

export default async function NewBlogPostPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect("/auth/login")

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Create New Post</h1>
        <p className="text-gray-600 mt-2">Write and publish a new blog post</p>
      </div>
      <EnhancedBlogEditor mode="create" />
    </div>
  )
}