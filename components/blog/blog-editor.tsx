"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Save, Eye, EyeOff, Tag, X, Image, FileText,
  Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Bold, Italic, List, Link2, Quote, Code, Heading2
} from "lucide-react"

interface BlogEditorProps {
  initialData?: {
    id?: number
    title?: string
    excerpt?: string
    content?: string
    cover_image?: string
    author?: string
    status?: "draft" | "published"
    tags?: string[]
    meta_title?: string
    meta_description?: string
  }
  mode: "create" | "edit"
}

// ── Toolbar button ────────────────────────────────────────────────────────
function ToolbarButton({
  onClick, title, children
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
    >
      {children}
    </button>
  )
}

export function BlogEditor({ initialData, mode }: BlogEditorProps) {
  const router = useRouter()

  // ── Form state ──────────────────────────────────────────────────────────
  const [title, setTitle] = useState(initialData?.title || "")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "")
  const [author, setAuthor] = useState(initialData?.author || "Qyantra Team")
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft")
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || "")
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "")

  // ── UI state ────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const [seoOpen, setSeoOpen] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")

  // ── Word/char count ─────────────────────────────────────────────────────
  useEffect(() => {
    setCharCount(content.length)
    setWordCount(content.split(/\s+/).filter(Boolean).length)
  }, [content])

  // ── Auto save draft ─────────────────────────────────────────────────────
  useEffect(() => {
    if (mode === "edit" && initialData?.id) {
      setAutoSaveStatus("unsaved")
      const timer = setTimeout(async () => {
        setAutoSaveStatus("saving")
        try {
          await fetch(`/api/admin/blog/${initialData.id}`, {
            method: "PATCH",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, excerpt, content, status: "draft" }),
          })
          setAutoSaveStatus("saved")
        } catch {
          setAutoSaveStatus("unsaved")
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [title, excerpt, content])

  // ── Add tag ─────────────────────────────────────────────────────────────
  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags((prev) => [...prev, tag])
      setTagInput("")
    }
  }, [tagInput, tags])

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  // ── Toolbar actions ─────────────────────────────────────────────────────
  const insertMarkdown = useCallback((before: string, after = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const newContent =
      content.substring(0, start) +
      before + selected + after +
      content.substring(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      )
    }, 0)
  }, [content])

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (submitStatus: "draft" | "published") => {
    setError(null)
    setSuccess(null)

    if (!title.trim()) { setError("Title is required"); return }
    if (!excerpt.trim()) { setError("Excerpt is required"); return }
    if (!content.trim()) { setError("Content is required"); return }
    if (title.length > 200) { setError("Title too long (max 200 chars)"); return }
    if (excerpt.length > 500) { setError("Excerpt too long (max 500 chars)"); return }

    setSaving(true)

    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        cover_image: coverImage.trim() || null,
        author: author.trim() || "Qyantra Team",
        status: submitStatus,
        tags,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
      }

      const url = mode === "create"
        ? "/api/admin/blog"
        : `/api/admin/blog/${initialData?.id}`

      const method = mode === "create" ? "POST" : "PATCH"

      const res = await fetch(url, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to save post")
        return
      }

      setSuccess(
        submitStatus === "published"
          ? "Post published successfully! 🎉"
          : "Draft saved successfully!"
      )

      setTimeout(() => {
        router.push("/admin/blog")
        router.refresh()
      }, 1500)

    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/admin/blog")}
              className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            >
              ← Back
            </button>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {title || "Untitled Post"}
              </p>
              <p className="text-xs text-gray-400">
                {autoSaveStatus === "saved" && "✓ All changes saved"}
                {autoSaveStatus === "saving" && "Saving..."}
                {autoSaveStatus === "unsaved" && "Unsaved changes"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status badge */}
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              status === "published"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {status === "published" ? "Published" : "Draft"}
            </span>

            {/* Preview toggle */}
            <button
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {preview ? "Edit" : "Preview"}
            </button>

            {/* Save draft */}
            <button
              onClick={() => handleSubmit("draft")}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Draft
            </button>

            {/* Publish */}
            <button
              onClick={() => handleSubmit("published")}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {status === "published" ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main editor */}
          <div className="lg:col-span-2 space-y-4">

            {/* Title */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title..."
                maxLength={200}
                className="w-full text-2xl font-black text-gray-900 placeholder-gray-300 border-none outline-none resize-none bg-transparent"
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400">Slug: {title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "post-slug"}</p>
                <p className="text-xs text-gray-400">{title.length}/200</p>
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Excerpt / Summary
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary of the post (shown in listing and SEO)..."
                rows={3}
                maxLength={500}
                className="w-full text-sm text-gray-700 placeholder-gray-300 border-none outline-none resize-none bg-transparent leading-relaxed"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{excerpt.length}/500</p>
            </div>

            {/* Content editor */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 flex-wrap">
                <ToolbarButton onClick={() => insertMarkdown("## ")} title="Heading">
                  <Heading2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => insertMarkdown("**", "**")} title="Bold">
                  <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => insertMarkdown("*", "*")} title="Italic">
                  <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => insertMarkdown("\n- ")} title="List">
                  <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => insertMarkdown("[", "](url)")} title="Link">
                  <Link2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => insertMarkdown("\n> ")} title="Quote">
                  <Quote className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => insertMarkdown("`", "`")} title="Code">
                  <Code className="w-4 h-4" />
                </ToolbarButton>
                <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
                  <span>{wordCount} words</span>
                  <span>{charCount} chars</span>
                </div>
              </div>

              {/* Editor / Preview */}
              {preview ? (
                <div className="p-6 min-h-96 prose max-w-none">
                  <div
                    className="blog-preview text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: content
                        .replace(/## (.*)/g, '<h2 class="text-xl font-black text-gray-900 mt-6 mb-2">$1</h2>')
                        .replace(/### (.*)/g, '<h3 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-gray-900">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                        .replace(/`(.*?)`/g, '<code class="bg-gray-100 text-blue-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
                        .replace(/^> (.*)/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-3">$1</blockquote>')
                        .replace(/^- (.*)/gm, '<li class="flex items-start gap-2 text-gray-600"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2"></span><span>$1</span></li>')
                        .replace(/\n\n/g, '</p><p class="text-gray-600 leading-relaxed mb-4">')
                    }}
                  />
                </div>
              ) : (
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Write your blog post in Markdown...

## Introduction
Start with a hook that grabs attention.

## Main Content
Add your tips, guides and information here.

## Conclusion
Wrap up with a call to action.

You can use special components like:
<Callout type="tip">This is a tip!</Callout>
<EarningCard amount="₹50" task="Install app" time="5 minutes" />`}
                  className="w-full p-6 text-sm text-gray-700 placeholder-gray-300 border-none outline-none resize-none bg-transparent font-mono leading-relaxed min-h-96"
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Publish settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Publish Settings</p>

              {/* Status toggle */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">Status</span>
                <button
                  onClick={() => setStatus(status === "draft" ? "published" : "draft")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    status === "published" ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    status === "published" ? "translate-x-7" : "translate-x-1"
                  }`} />
                </button>
              </div>

              {/* Author */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={100}
                />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => handleSubmit("draft")}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit("published")}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {status === "published" ? "Update Post" : "Publish Post"}
                </button>
              </div>
            </div>

            {/* Cover image */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Image className="w-3.5 h-3.5" /> Cover Image
              </p>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://image-url.com/image.jpg"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="mt-3 w-full h-32 object-cover rounded-xl"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Tags
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={50}
                />
                <button
                  onClick={addTag}
                  className="bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <p className="text-xs text-gray-400">No tags yet</p>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">{tags.length}/10 tags</p>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <button
                onClick={() => setSeoOpen(!seoOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> SEO Settings
                </span>
                {seoOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {seoOpen && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                      Meta Title <span className="text-gray-400">({metaTitle.length}/200)</span>
                    </label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={title || "SEO title..."}
                      maxLength={200}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                      Meta Description <span className="text-gray-400">({metaDescription.length}/500)</span>
                    </label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder={excerpt || "SEO description..."}
                      rows={3}
                      maxLength={500}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* SEO Preview */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-500 mb-2">Google Preview:</p>
                    <p className="text-blue-600 text-sm font-medium truncate">
                      {metaTitle || title || "Post Title"}
                    </p>
                    <p className="text-green-700 text-xs">www.qyantra.online/blog/...</p>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                      {metaDescription || excerpt || "Post description..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}