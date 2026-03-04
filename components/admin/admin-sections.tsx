"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Plus, Trash2, X, Edit, Save, Package,
  GripVertical, Search, ChevronDown, ChevronUp
} from "lucide-react"

interface Product {
  id: number
  name: string
  category: string
  price: number
  image_url: string | null
}

interface Section {
  id: number
  title: string
  subtitle: string | null
  emoji: string
  sort_order: number
  is_active: boolean
  products: Product[]
}

export function AdminSections() {
  const [sections, setSections] = useState<Section[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [expandedSection, setExpandedSection] = useState<number | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [savingSection, setSavingSection] = useState(false)
  const [form, setForm] = useState({ title: '', subtitle: '', emoji: '🔥' })
  const [editForm, setEditForm] = useState({ title: '', subtitle: '', emoji: '' })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [sectionsRes, productsRes] = await Promise.all([
        fetch('/api/admin/sections'),
        fetch('/api/products')
      ])
      if (sectionsRes.ok) setSections((await sectionsRes.json()).sections || [])
      if (productsRes.ok) setAllProducts((await productsRes.json()).products || [])
    } catch (error) {
      console.error('Error fetching:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSection = async () => {
    if (!form.title.trim()) return
    setSavingSection(true)
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sort_order: sections.length })
      })
      if (res.ok) {
        const data = await res.json()
        setSections(prev => [...prev, data.section])
        setForm({ title: '', subtitle: '', emoji: '🔥' })
        setShowForm(false)
      }
    } finally {
      setSavingSection(false)
    }
  }

  const saveEdit = async (section: Section) => {
    setSavingSection(true)
    try {
      const res = await fetch(`/api/admin/sections/${section.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        setSections(prev => prev.map(s => s.id === section.id ? { ...s, ...editForm } : s))
        setEditingSection(null)
      }
    } finally {
      setSavingSection(false)
    }
  }

  const deleteSection = async (id: number) => {
    if (!confirm('Delete this section?')) return
    const res = await fetch(`/api/admin/sections/${id}`, { method: 'DELETE' })
    if (res.ok) setSections(prev => prev.filter(s => s.id !== id))
  }

  const toggleActive = async (section: Section) => {
    const res = await fetch(`/api/admin/sections/${section.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !section.is_active })
    })
    if (res.ok) setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_active: !s.is_active } : s))
  }

  const addProductToSection = async (sectionId: number, productId: number) => {
    const res = await fetch(`/api/admin/sections/${sectionId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId })
    })
    if (res.ok) {
      const product = allProducts.find(p => p.id === productId)
      if (product) {
        setSections(prev => prev.map(s => s.id === sectionId
          ? { ...s, products: [...s.products, product] }
          : s
        ))
      }
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to add product')
    }
  }

  const removeProductFromSection = async (sectionId: number, productId: number) => {
    const res = await fetch(`/api/admin/sections/${sectionId}/products`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId })
    })
    if (res.ok) {
      setSections(prev => prev.map(s => s.id === sectionId
        ? { ...s, products: s.products.filter(p => p.id !== productId) }
        : s
      ))
    }
  }

  const emojis = ['🔥', '⭐', '💰', '🎯', '📱', '👗', '🏠', '🎮', '💄', '🏋️', '📚', '🍳']

  if (loading) return <div className="p-8 text-center text-gray-500">Loading sections...</div>

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Sections</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create and manage homepage sections like "Trending Now", "Top 5 Watches"</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> New Section
        </Button>
      </div>

      {/* Create Section Form */}
      {showForm && (
        <Card className="border border-blue-200 bg-blue-50 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Create New Section</h3>
              <button onClick={() => setShowForm(false)} title="Close" aria-label="Close"
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label className="text-sm">Section Title *</Label>
                <Input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
                  placeholder="e.g. Top 5 Trending Watches" className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-sm">Emoji</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {emojis.map(e => (
                    <button key={e} onClick={() => setForm(p => ({...p, emoji: e}))}
                      title={`Select emoji ${e}`} aria-label={`Select emoji ${e}`}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${form.emoji === e ? 'bg-blue-600 shadow-md scale-110' : 'bg-white border border-gray-200 hover:bg-blue-50'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-3">
                <Label className="text-sm">Subtitle <span className="text-gray-400">(optional)</span></Label>
                <Input value={form.subtitle} onChange={e => setForm(p => ({...p, subtitle: e.target.value}))}
                  placeholder="e.g. Most popular this week" className="mt-1 rounded-xl" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={createSection} disabled={savingSection || !form.title.trim()} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                {savingSection ? 'Creating...' : 'Create Section'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections List */}
      {sections.length === 0 ? (
        <Card className="border border-dashed border-gray-300 rounded-2xl">
          <CardContent className="p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No sections yet</h3>
            <p className="text-gray-500 text-sm">Create sections to organize products on the homepage</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map(section => {
            const isExpanded = expandedSection === section.id
            const isEditing = editingSection?.id === section.id
            const sectionProductIds = section.products.map(p => p.id)
            const availableProducts = allProducts.filter(p =>
              !sectionProductIds.includes(p.id) &&
              (productSearch === '' || p.name.toLowerCase().includes(productSearch.toLowerCase()))
            )

            return (
              <Card key={section.id} className={`border rounded-2xl transition-all ${section.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'} shadow-sm`}>
                <CardContent className="p-0">

                  {/* Section Header */}
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                      {section.emoji}
                    </div>

                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2 flex-wrap">
                        <Input value={editForm.title} onChange={e => setEditForm(p => ({...p, title: e.target.value}))}
                          className="h-8 text-sm rounded-lg flex-1 min-w-32" placeholder="Section title" />
                        <Input value={editForm.subtitle} onChange={e => setEditForm(p => ({...p, subtitle: e.target.value}))}
                          className="h-8 text-sm rounded-lg flex-1 min-w-32" placeholder="Subtitle (optional)" />
                        <div className="flex gap-1">
                          {emojis.map(e => (
                            <button key={e} onClick={() => setEditForm(p => ({...p, emoji: e}))}
                              title={`Select emoji ${e}`} aria-label={`Select emoji ${e}`}
                              className={`w-7 h-7 rounded-lg text-sm ${editForm.emoji === e ? 'bg-blue-600' : 'bg-gray-100'}`}>
                              {e}
                            </button>
                          ))}
                        </div>
                        <Button size="sm" onClick={() => saveEdit(section)} disabled={savingSection}
                          className="bg-blue-600 hover:bg-blue-700 rounded-lg h-8">
                          <Save className="w-3.5 h-3.5 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingSection(null)} className="rounded-lg h-8">
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{section.title}</h3>
                          <Badge className={section.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                            {section.is_active ? 'Active' : 'Hidden'}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700">{section.products.length} products</Badge>
                        </div>
                        {section.subtitle && <p className="text-xs text-gray-500 mt-0.5">{section.subtitle}</p>}
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => toggleActive(section)}
                          title={section.is_active ? 'Hide section' : 'Show section'}
                          aria-label={section.is_active ? 'Hide section' : 'Show section'}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${section.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {section.is_active ? 'Live' : 'Off'}
                        </button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingSection(section); setEditForm({ title: section.title, subtitle: section.subtitle || '', emoji: section.emoji }) }}
                          title="Edit section" aria-label="Edit section"
                          className="text-blue-600 hover:bg-blue-50 rounded-lg h-8 w-8 p-0">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                          title={isExpanded ? 'Collapse' : 'Expand'}
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          className="text-gray-600 hover:bg-gray-100 rounded-lg h-8 w-8 p-0">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteSection(section.id)}
                          title="Delete section" aria-label="Delete section"
                          className="text-red-500 hover:bg-red-50 rounded-lg h-8 w-8 p-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 space-y-4">

                      {/* Current Products in Section */}
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Products in this section</p>
                        {section.products.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">No products added yet</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {section.products.map(product => (
                              <div key={product.id} className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5">
                                {product.image_url && (
                                  <img src={product.image_url} alt={product.name} className="w-6 h-6 rounded-lg object-cover" />
                                )}
                                <span className="text-sm font-medium text-gray-900 max-w-32 truncate">{product.name}</span>
                                <span className="text-xs text-gray-500">₹{Number(product.price).toLocaleString()}</span>
                                <button onClick={() => removeProductFromSection(section.id, product.id)}
                                  title={`Remove ${product.name}`} aria-label={`Remove ${product.name}`}
                                  className="text-red-400 hover:text-red-600 ml-1">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add Products */}
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Add products</p>
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <Input value={productSearch} onChange={e => setProductSearch(e.target.value)}
                            placeholder="Search products to add..." className="pl-8 h-9 rounded-xl text-sm" />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1.5">
                          {availableProducts.slice(0, 20).map(product => (
                            <div key={product.id} className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-colors">
                              <div className="flex items-center gap-2">
                                {product.image_url ? (
                                  <img src={product.image_url} alt={product.name} className="w-8 h-8 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Package className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900 truncate max-w-48">{product.name}</p>
                                  <p className="text-xs text-gray-500">₹{Number(product.price).toLocaleString()} · {product.category}</p>
                                </div>
                              </div>
                              <Button size="sm" onClick={() => addProductToSection(section.id, product.id)}
                                className="bg-blue-600 hover:bg-blue-700 rounded-lg h-7 text-xs px-2.5">
                                <Plus className="w-3 h-3 mr-1" /> Add
                              </Button>
                            </div>
                          ))}
                          {availableProducts.length === 0 && (
                            <p className="text-sm text-gray-400 italic text-center py-3">
                              {productSearch ? 'No products match your search' : 'All products already added'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}