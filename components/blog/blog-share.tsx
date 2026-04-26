"use client"

import { useState } from "react"
import {
  Share2, Twitter, Linkedin, Facebook, Mail, MessageCircle,
  Copy, Check
} from "lucide-react"
import { getSocialShareUrls, BlogPost } from "@/lib/utils/blog-utils"

interface BlogShareProps {
  post: BlogPost
  baseUrl: string
}

export function BlogShare({ post, baseUrl }: BlogShareProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const shareUrls = getSocialShareUrls(post, baseUrl)
  const postUrl = `${baseUrl}/blog/${post.slug}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const openShare = (url: string) => {
    window.open(url, "_blank", "width=600,height=400")
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-56">
          <div className="space-y-2">
            {/* Twitter */}
            <button
              onClick={() => openShare(shareUrls.twitter)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Twitter className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium">Share on Twitter</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => openShare(shareUrls.linkedin)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Linkedin className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Share on LinkedIn</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => openShare(shareUrls.facebook)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Facebook className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Share on Facebook</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => openShare(shareUrls.whatsapp)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Share on WhatsApp</span>
            </button>

            {/* Email */}
            <button
              onClick={() => window.location.href = shareUrls.email}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Share via Email</span>
            </button>

            {/* Divider */}
            <div className="h-px bg-gray-200 my-2" />

            {/* Copy Link */}
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
