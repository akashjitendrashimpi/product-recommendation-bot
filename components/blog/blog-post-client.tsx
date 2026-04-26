"use client"

import { useState, useMemo } from "react"
import { MDXRemoteSerializeResult } from "next-mdx-remote"
import { BlogContent } from "./blog-content"
import { generateTableOfContents } from "@/lib/utils/blog-utils"
import { BlogPost } from "@/lib/db/blog"
import { ChevronDown } from "lucide-react"

interface BlogPostClientProps {
  post: BlogPost
  mdxSource: MDXRemoteSerializeResult
}

export function BlogPostClient({ post, mdxSource }: BlogPostClientProps) {
  const [showTOC, setShowTOC] = useState(true)

  const toc = useMemo(() => {
    return generateTableOfContents(post.content)
  }, [post.content])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-3">
        <BlogContent source={mdxSource} />
      </div>

      {/* Sidebar - Table of Contents */}
      {toc.length > 0 && (
        <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowTOC(!showTOC)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 font-semibold text-gray-900 flex items-center justify-between transition-colors"
            >
              <span>Table of Contents</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showTOC ? "rotate-180" : ""}`}
              />
            </button>

            {showTOC && (
              <nav className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {toc.map((item, i) => (
                  <a
                    key={i}
                    href={`#${item.id}`}
                    className="block text-sm text-gray-700 hover:text-blue-600 transition-colors py-1 truncate"
                    style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
