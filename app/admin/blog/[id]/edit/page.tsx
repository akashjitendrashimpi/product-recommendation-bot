import { getSession } from "@/lib/auth/session"
import { redirect, notFound } from "next/navigation"
import { getPostById } from "@/lib/db/blog"
import { BlogEditor } from "@/components/blog/blog-editor"
import { validateId } from "@/lib/security/validation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Edit Blog Post | Admin",
  robots: { index: false, follow: false },
}

export default async function EditBlogPostPage(
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session?.isAdmin) redirect("/auth/login")

  const id = validateId(params.id)
  if (!id) notFound()

  const post = await getPostById(id)
  if (!post) notFound()

  return (
    <BlogEditor
      mode="edit"
      initialData={{
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.cover_image || "",
        author: post.author,
        status: post.status,
        tags: post.tags,
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
      }}
    />
  )
}