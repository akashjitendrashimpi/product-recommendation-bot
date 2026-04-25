import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { BlogEditor } from "@/components/blog/blog-editor"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "New Blog Post | Admin",
  robots: { index: false, follow: false },
}

export default async function NewBlogPostPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect("/auth/login")

  return <BlogEditor mode="create" />
}