"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { createLowlight, common } from "lowlight"
import {
  Bold, Italic, Heading2, Heading3, Undo2, Redo2, List, ListOrdered,
  Quote, Code, Link2, Image as ImageIcon, Type, Palette, Trash2
} from "lucide-react"
import { useState } from "react"
import "./rich-text-editor.css"

// Create lowlight instance
const lowlight = createLowlight(common)

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"]
const colors = ["#000000", "#FF0000", "#00AA00", "#0000FF", "#FF8800", "#AA00FF", "#00AAAA", "#999999"]

export function RichTextEditor({ value, onChange, placeholder = "Start typing..." }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [fontSize, setFontSize] = useState("16px")

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const addImage = () => {
    const url = prompt("Enter image URL:")
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const addLink = () => {
    if (linkUrl && editor.view.state.selection.content().size > 0) {
      editor.chain().focus().toggleLink({ href: linkUrl }).run()
      setLinkUrl("")
      setShowLinkInput(false)
    }
  }

  const handleFontSize = (size: string) => {
    setFontSize(size)
    editor.chain().focus().setMark("textStyle", { fontSize: size }).run()
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 space-y-2">
        {/* Row 1: Text Formatting */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-colors ${editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-colors ${editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300" />

          {/* Font Size */}
          <select
            value={fontSize}
            onChange={(e) => handleFontSize(e.target.value)}
            className="px-2 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
          >
            {fontSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          {/* Color Picker */}
          <div className="flex gap-1">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => editor.chain().focus().setColor(color).run()}
                className="w-6 h-6 rounded-md border-2 border-gray-300 hover:border-blue-500 transition-colors"
                style={{ backgroundColor: color }}
                title={`Color: ${color}`}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-gray-300" />

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-lg transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded-lg transition-colors ${editor.isActive("heading", { level: 3 }) ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Row 2: Lists & Formatting */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg transition-colors ${editor.isActive("bulletList") ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-lg transition-colors ${editor.isActive("orderedList") ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}`}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-lg transition-colors ${editor.isActive("blockquote") ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded-lg transition-colors ${editor.isActive("codeBlock") ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}`}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300" />

          <button
            onClick={addImage}
            className="p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors"
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowLinkInput(!showLinkInput)}
              className={`p-2 rounded-lg transition-colors ${editor.isActive("link") ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}`}
              title="Add Link"
            >
              <Link2 className="w-4 h-4" />
            </button>
            {showLinkInput && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10 min-w-48">
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addLink()}
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={addLink} className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Add</button>
                  <button onClick={() => setShowLinkInput(false)} className="flex-1 px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300">Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300" />

          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().clearContent().run()}
            className="p-2 rounded-lg bg-white hover:bg-red-50 hover:text-red-600 transition-colors ml-auto"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-96 focus:outline-none"
      />
    </div>
  )
}
