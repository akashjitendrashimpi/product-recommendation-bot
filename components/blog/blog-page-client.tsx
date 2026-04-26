"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import { BlogCard } from "./blog-card"
import { BlogSearchFilter } from "./blog-search-filter"
import { BlogPost } from "@/lib/utils/blog-utils"

interface BlogPageClientProps {
  posts: BlogPost[]
}

export function BlogPageClient({ posts }: BlogPageClientProps) {
  const [filteredPosts, setFilteredPosts] = useState(posts)

  return (
    <>
      {/* Search & Filter */}
      <div className="mb-8">
        <BlogSearchFilter posts={posts} onFilter={setFilteredPosts} />
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-semibold">No posts found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-bold text-gray-700">All Posts</p>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
              {filteredPosts.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
