"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Save, Eye, EyeOff, Tag, X, Image, FileText, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Copy, Info, BarChart3, BookOpen
} from "lucide-react"
import { RichTextEditor } from "./rich-text-editor"
import {
  sanitizeHTML, sanitizeInput, validateBlogPost, generateCSRFToken,
  validateCSRFToken
} from "@/lib/security/blog-security"
import {
  generateSlug, generateExcerpt, generateTableOfContents,
  stripHTML, getReadingTime, calculateEngagementScore, TOCItem
} from "@/lib/utils/blog-utils"
import { useToast } from "@/hooks/use-toast"

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

export function EnhancedBlogEditor({ initialData, mode }: BlogEditorProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Form state
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

  // UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const [seoOpen, setSeoOpen] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState("")
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [engagementScore, setEngagementScore] = useState(0)
  const [toc, setToc] = useState<TOCItem[]>([])
  const [csrfToken, setCsrfToken] = useState("")

  // Initialize CSRF token
  useEffect(() => {
    const token = generateCSRFToken()
    setCsrfToken(token)
  }, [])

  // Update stats
  useEffect(() => {
    const plainText = stripHTML(content)
    setCharCount(content.length)
    setWordCount(plainText.split(/\s+/).filter(Boolean).length)
    setReadingTime(getReadingTime(content))
    setToc(generateTableOfContents(content))

    // Calculate engagement score
    const score = calculateEngagementScore({
      id: 0,
      title,
      content,
      excerpt,
      slug: "",
      author,
      tags,
      status,
      cover_image: coverImage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    setEngagementScore(score)
  }, [title, content, excerpt, tags, coverImage, author, status])

  // Auto-save draft
  useEffect(() => {
    if (mode === "edit" && initialData?.id && content.trim().length > 0) {
      setAutoSaveStatus("unsaved")
      const timer = setTimeout(async () => {
        setAutoSaveStatus("saving")
        try {
          const response = await fetch(`/api/admin/blog/${initialData.id}`, {
            method: "PATCH",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken,
            },
            body: JSON.stringify({
              title: sanitizeInput(title),
              excerpt: sanitizeInput(excerpt),
              content: sanitizeHTML(content),
              status: "draft",
            }),
          })
          if (response.ok) {
            setAutoSaveStatus("saved")
          } else {
            setAutoSaveStatus("unsaved")
          }
        } catch {
          setAutoSaveStatus("unsaved")
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [title, excerpt, content, csrfToken])

  const addTag = useCallback(() => {
    const sanitized = sanitizeInput(tagInput.trim())
    if (sanitized && !tags.includes(sanitized) && tags.length < 10) {
      setTags([...tags, sanitized])
      setTagInput("")
    }
  }, [tagInput, tags])

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const autoGenerateExcerpt = () => {
    const generated = generateExcerpt(content, 150)
    setExcerpt(generated)
    toast({ title: "Success", description: "Excerpt auto-generated" })
  }

  const validateAndSave = async () => {
    setError(null)

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title)
    const sanitizedExcerpt = sanitizeInput(excerpt)
    const sanitizedContent = sanitizeHTML(content)

    // Validate
    const validation = validateBlogPost({
      title: sanitizedTitle,
      excerpt: sanitizedExcerpt,
      content: sanitizedContent,
      tags,
    })

    if (!validation.valid) {
      setError(validation.errors.join(", "))
      toast({ title: "Validation Error", description: validation.errors[0], variant: "destructive" })
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!(await validateAndSave())) return

    setSaving(true)
    try {
      const slug = generateSlug(title)
      const endpoint = mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${initialData?.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(endpoint, {
        method,
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          title: sanitizeInput(title),
          slug,
          excerpt: sanitizeInput(excerpt),
          content: sanitizeHTML(content),
          cover_image: coverImage,
          author: sanitizeInput(author),
          tags,
          status,
          meta_title: sanitizeInput(metaTitle),
          meta_description: sanitizeInput(metaDescription),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save post")
      }

      setSuccess("Post saved successfully!")
      toast({ title: "Success", description: "Post saved successfully" })

      setTimeout(() => {
        router.push("/admin/blog")
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save post"
      setError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (preview) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setPreview(false)}
          className="mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
        >
          <Eye className="w-4 h-4" /> Back to Edit
        </button>

        <article className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none">
          {coverImage && (
            <img src={coverImage} alt={title} className="w-full h-96 object-cover rounded-lg mb-6" />
          )}
          <h1>{title}</h1>
          <div className="flex gap-4 text-sm text-gray-600 mb-6">
            <span>{author}</span>
            <span>{new Date().toLocaleDateString()}</span>
            <span>{readingTime}</span>
          </div>
          <p className="text-gray-700 italic mb-6">{excerpt}</p>
          <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }} />
        </article>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-0">
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="order-1 lg:col-span-2 space-y-6">
          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-blue-50 border border-blue-200 rounded-2xl p-4 gap-3">
            <div className="flex items-center gap-2">
              {autoSaveStatus === "saved" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {autoSaveStatus === "saving" && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
              {autoSaveStatus === "unsaved" && <AlertCircle className="w-5 h-5 text-yellow-600" />}
              <span className="text-sm font-bold text-gray-700">
                {autoSaveStatus === "saved" && "All changes saved"}
                {autoSaveStatus === "saving" && "Saving content..."}
                {autoSaveStatus === "unsaved" && "Unsaved changes"}
              </span>
            </div>
            <button
              onClick={() => setPreview(true)}
              title="Live Preview"
              aria-label="Preview post changes"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <Eye className="w-4 h-4" /> Live Preview
            </button>
          </div>

          {/* Errors */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-red-900 uppercase tracking-wider">Error Detected</p>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="bg-white rounded-2xl border border-gray-100 p-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-3 mt-2">Post Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. 10 Best Earphones Under 2000"
              className="w-full px-4 py-3 text-lg font-black text-gray-900 border-none focus:ring-0 placeholder:text-gray-200"
              maxLength={200}
            />
            <div className="flex justify-end px-3 pb-2">
              <span className={`text-[10px] font-bold ${title.length > 180 ? "text-red-500" : "text-gray-300"}`}>
                {title.length}/200
              </span>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <label htmlFor="cover-image" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Cover Image URL</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="cover-image"
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>
            </div>
            {coverImage && (
              <div className="relative group rounded-xl overflow-hidden border border-gray-100">
                <img src={coverImage} alt="Preview" className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-gray-900">Current Preview</span>
                </div>
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Short Summary (Excerpt)</label>
              <button
                onClick={autoGenerateExcerpt}
                title="Auto Generate Excerpt"
                aria-label="Auto generate excerpt from content"
                className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors uppercase tracking-tight"
              >
                Auto Generate
              </button>
            </div>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of your post for social sharing and search results..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm font-medium leading-relaxed"
              rows={3}
              maxLength={300}
            />
            <div className="flex justify-end">
              <span className="text-[10px] font-bold text-gray-300">{excerpt.length}/300</span>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Content Editor</span>
            </div>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Post Categories & Tags</label>
            <div className="flex gap-2">
              <input
                id="tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="Add keyword..."
                aria-label="Add new tag"
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
              <button
                onClick={addTag}
                className="px-4 py-3 bg-gray-900 text-white rounded-xl flex items-center gap-2 hover:bg-black transition-all active:scale-95"
              >
                <Tag className="w-4 h-4" /> <span className="hidden sm:inline text-sm font-bold">Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 group transition-all hover:bg-blue-100">
                  {tag}
                  <button 
                    onClick={() => removeTag(i)} 
                    title="Remove tag"
                    aria-label={`Remove tag ${tag}`}
                    className="text-blue-300 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Save Button (Sticky on Mobile) */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 lg:relative lg:p-0 lg:bg-transparent lg:border-none z-[60]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-green-200 lg:shadow-none"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "PUBLISHING..." : "PUBLISH POST NOW"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="order-2 space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
             <div className="flex items-center gap-2 mb-2">
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                 <BarChart3 className="w-4 h-4" />
               </div>
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Writing Stats</h3>
             </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {[
                { label: "Words", value: wordCount },
                { label: "Chars", value: charCount },
                { label: "Read Time", value: readingTime },
                { label: "SEO Score", value: `${engagementScore}%`, positive: true },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3 border border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{s.label}</p>
                  <p className={`text-lg font-black ${s.positive ? "text-green-600" : "text-gray-900"}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Table of Contents */}
          {toc.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                 <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                   <BookOpen className="w-4 h-4" />
                 </div>
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Outline</h3>
               </div>
              <ul className="space-y-2">
                {toc.map((item, i) => (
                  <li key={i} style={{ marginLeft: `${(item.level - 1) * 8}px` }} className="flex items-start gap-2 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-200 mt-1.5 group-hover:bg-blue-500 transition-colors" />
                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors line-clamp-1">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Publication Settings */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-2">Publishing</h3>
            
            <div>
              <label htmlFor="blog-status" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Visibility Status</label>
              <select
                id="blog-status"
                value={status}
                title="Select post status"
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-700"
              >
                <option value="draft">📁 Save as Draft</option>
                <option value="published">🚀 Public Live</option>
              </select>
            </div>

            <div>
              <label htmlFor="blog-author" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Assigned Author</label>
              <input
                id="blog-author"
                type="text"
                value={author}
                title="Post Author"
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-700"
              />
            </div>
          </div>

          {/* SEO Advanced */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full px-5 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">SEO Config</span>
              </div>
              {seoOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {seoOpen && (
              <div className="p-5 space-y-4 border-t border-gray-50 bg-gray-50/30">
                <div>
                  <label htmlFor="meta-title" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Google Search Title</label>
                  <input
                    id="meta-title"
                    type="text"
                    value={metaTitle}
                    title="Meta Title"
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title}
                    maxLength={60}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-[9px] font-bold text-gray-300">{metaTitle.length}/60</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="meta-description" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Meta Description Tag</label>
                  <textarea
                    id="meta-description"
                    value={metaDescription}
                    title="Meta Description"
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={excerpt}
                    maxLength={160}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-[9px] font-bold text-gray-300">{metaDescription.length}/160</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
