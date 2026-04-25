"use client"

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote"
import { CheckCircle2, AlertTriangle, Info, Lightbulb } from "lucide-react"

// ── Custom MDX Components ─────────────────────────────────────────────────
const components = {
  // Headings
  h1: (props: any) => (
    <h1 className="text-3xl font-black text-gray-900 mt-8 mb-4 leading-tight" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="text-2xl font-black text-gray-900 mt-8 mb-3 leading-tight border-b border-gray-100 pb-2" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2 leading-tight" {...props} />
  ),
  h4: (props: any) => (
    <h4 className="text-lg font-bold text-gray-800 mt-4 mb-2" {...props} />
  ),

  // Paragraph
  p: (props: any) => (
    <p className="text-gray-600 leading-relaxed mb-4 text-base" {...props} />
  ),

  // Links
  a: (props: any) => (
    
      className="text-blue-600 font-semibold hover:text-blue-700 underline underline-offset-2 transition-colors"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),

  // Lists
  ul: (props: any) => (
    <ul className="space-y-2 mb-4 ml-4" {...props} />
  ),
  ol: (props: any) => (
    <ol className="space-y-2 mb-4 ml-4 list-decimal" {...props} />
  ),
  li: (props: any) => (
    <li className="text-gray-600 leading-relaxed flex items-start gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
      <span {...props} />
    </li>
  ),

  // Blockquote
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50 rounded-r-2xl px-6 py-4 my-6 italic text-gray-700" {...props} />
  ),

  // Code
  code: (props: any) => (
    <code className="bg-gray-100 text-blue-700 px-2 py-0.5 rounded-lg text-sm font-mono" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-gray-900 text-gray-100 rounded-2xl p-6 overflow-x-auto my-6 text-sm font-mono leading-relaxed" {...props} />
  ),

  // Horizontal rule
  hr: () => (
    <hr className="border-gray-200 my-8" />
  ),

  // Table
  table: (props: any) => (
    <div className="overflow-x-auto my-6 rounded-2xl border border-gray-200">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th className="bg-gray-50 text-gray-700 font-bold px-4 py-3 text-left border-b border-gray-200" {...props} />
  ),
  td: (props: any) => (
    <td className="px-4 py-3 text-gray-600 border-b border-gray-100" {...props} />
  ),

  // Image
  img: (props: any) => (
    <img
      className="rounded-2xl w-full object-cover my-6 shadow-sm"
      loading="lazy"
      {...props}
    />
  ),

  // Strong & Em
  strong: (props: any) => (
    <strong className="font-black text-gray-900" {...props} />
  ),
  em: (props: any) => (
    <em className="italic text-gray-700" {...props} />
  ),

  // Custom components available in MDX
  Callout: ({ type = "info", children }: { type?: "info" | "success" | "warning" | "tip", children: React.ReactNode }) => {
    const configs = {
      info: { icon: Info, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", iconColor: "text-blue-500" },
      success: { icon: CheckCircle2, bg: "bg-green-50", border: "border-green-200", text: "text-green-800", iconColor: "text-green-500" },
      warning: { icon: AlertTriangle, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", iconColor: "text-amber-500" },
      tip: { icon: Lightbulb, bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800", iconColor: "text-purple-500" },
    }
    const cfg = configs[type]
    const Icon = cfg.icon
    return (
      <div className={`${cfg.bg} ${cfg.border} border rounded-2xl p-4 my-6 flex gap-3`}>
        <Icon className={`w-5 h-5 ${cfg.iconColor} flex-shrink-0 mt-0.5`} />
        <div className={`${cfg.text} text-sm leading-relaxed`}>{children}</div>
      </div>
    )
  },

  EarningCard: ({ amount, task, time }: { amount: string, task: string, time: string }) => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 my-4 flex items-center gap-4">
      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
        💰
      </div>
      <div>
        <p className="text-2xl font-black text-green-700">{amount}</p>
        <p className="text-sm text-gray-600">{task}</p>
        <p className="text-xs text-gray-400 mt-0.5">⏱ {time}</p>
      </div>
    </div>
  ),
}

interface BlogContentProps {
  source: MDXRemoteSerializeResult
}

export function BlogContent({ source }: BlogContentProps) {
  return (
    <div className="prose-custom max-w-none">
      <MDXRemote {...source} components={components} />
    </div>
  )
}