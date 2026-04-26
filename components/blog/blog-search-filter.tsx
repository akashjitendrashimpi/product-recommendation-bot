"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Filter, X } from "lucide-react"
import { searchPosts, filterByTag, sortByDate, getAllTags, BlogPost } from "@/lib/utils/blog-utils"

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
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search blog posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter Toggle & Sort */}
      <div className="flex gap-3 items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
              {selectedTags.length > 0 ? selectedTags.length : "•"}
            </span>
          )}
        </button>

        <select
          aria-label="Sort blog posts"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-700"
        >
          <option value="recent">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.length > 0 ? (
                allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {tag}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-600">No tags available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold">{filtered.length}</span> of{" "}
        <span className="font-semibold">{posts.length}</span> posts
      </div>
    </div>
  )
}
