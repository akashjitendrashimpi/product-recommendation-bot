"use client"
import { Trash2 } from "lucide-react"

export function DeleteButton({ postId }: { postId: number }) {
  return (
    <button
      type="button"
      onClick={async () => {
        if (!confirm("Are you sure you want to delete this post?")) return
        const res = await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" })
        if (res.ok) window.location.reload()
      }}
      className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
      title="Delete post"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}