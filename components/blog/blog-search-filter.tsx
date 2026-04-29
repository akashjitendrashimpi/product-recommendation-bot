"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Filter, X } from "lucide-react"
import { searchPosts, sortByDate, getAllTags, BlogPost } from "@/lib/utils/blog-utils"

interface BlogSearchFilterProps {
  posts: BlogPost[]
  onFilter: (filtered: BlogPost[]) => void
}

export function BlogSearchFilter({ posts, onFilter }: BlogSearchFilterProps) {
  const [query, setQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent")
  const [showFilters, setShowFilters] = useState(false)

  const allTags = useMemo(() => getAllTags(posts), [posts])

  // Filter posts
  const filtered = useMemo(() => {
    let result = [...posts]

    // Search
    if (query.trim()) {
      result = searchPosts(result, query)
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter(post =>
        selectedTags.some(tag => post.tags.includes(tag))
      )
    }

    // Sort
    result = sortByDate(result, sortBy === "recent" ? "desc" : "asc")

    return result
  }, [query, selectedTags, sortBy, posts])

  // Call parent callback
  useEffect(() => {
    onFilter(filtered)
  }, [filtered, onFilter])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setQuery("")
    setSelectedTags([])
    setSortBy("recent")
  }

  const hasActiveFilters = query.trim() !== "" || selectedTags.length > 0

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl group-focus-within:bg-blue-500/10 transition-all opacity-0 group-focus-within:opacity-100" />
        <div className="relative flex items-center">
          <Search className="absolute left-5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search insights, guides, and tips..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-14 pr-5 py-5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-gray-900 font-medium placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border ${
              showFilters || hasActiveFilters
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50 shadow-sm"
            }`}
          >
            <Filter className={`w-4 h-4 ${showFilters || hasActiveFilters ? "text-white" : "text-blue-500"}`} />
            <span>Refine Search</span>
            {selectedTags.length > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-white text-blue-600 rounded-full text-[10px]">
                {selectedTags.length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-colors"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="sort-posts" className="sr-only">Sort by</label>
          <select
            id="sort-posts"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="pl-5 pr-10 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 text-xs font-black uppercase tracking-widest text-gray-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
          >
            <option value="recent">Latest Arrivals</option>
            <option value="oldest">Historical</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-[2rem] p-8 shadow-inner animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Filter by Category</h3>
              <div className="flex flex-wrap gap-2.5">
                {allTags.length > 0 ? (
                  allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-tight transition-all active:scale-95 ${
                        selectedTags.includes(tag)
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                          : "bg-white border border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600 shadow-sm"
                      }`}
                    >
                      {tag}
                    </button>
                  ))
                ) : (
                  <p className="text-sm font-medium text-gray-400">No categories found in current catalog.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="h-px flex-1 bg-gray-50" />
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
          Displaying <span className="text-blue-500">{filtered.length}</span> results
        </p>
        <div className="h-px flex-1 bg-gray-50" />
      </div>
    </div>
  )
}
