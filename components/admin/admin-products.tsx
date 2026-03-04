"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Plus, Search, Trash2, X, Package, Edit, Save,
  ExternalLink, Star, Filter, ShoppingBag
} from "lucide-react"

interface Product {
  id: number
  product_id: string
  name: string
  category: string
  price: number
  image_url: string | null
  description: string | null
  amazon_link: string | null
  flipkart_link: string | null
  quality_score: number
  popularity_score: number
  is_active: boolean
}

const emptyForm = {
  name: '', category: '', price: '', description: '',
  image_url: '', amazon_link: '', flipkart_link: '',
  quality_score: '8', popularity_score: '5'
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [inlineEditId, setInlineEditId] = useState<number | null>(null)
  const [inlineForm, setInlineForm] = useState<Partial<Product>>({})
  const [savingInline, setSavingInline] = useState(false)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async () => {
    if (!form.name || !form.category || !form.price) {
      alert('Please fill in name, category and price')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          product_id: `manual_${Date.now()}`,
          price: parseFloat(form.price),
          quality_score: parseFloat(form.quality_score),
          popularity_score: parseFloat(form.popularity_score),
        })
      })
      if (res.ok) {
        setShowForm(false)
        setForm(emptyForm)
        fetchProducts()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const startInlineEdit = (product: Product) => {
    setInlineEditId(product.id)
    setInlineForm({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description || '',
      image_url: product.image_url || '',
      amazon_link: product.amazon_link || '',
      flipkart_link: product.flipkart_link || '',
      quality_score: product.quality_score,
      popularity_score: product.popularity_score,
    })
  }

  const saveInlineEdit = async (id: number) => {
    setSavingInline(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inlineForm),
      })
      if (res.ok) {
        const { product } = await res.json()
        setProducts(prev => prev.map(p => p.id === id ? product : p))
        setInlineEditId(null)
        setInlineForm({})
      } else {
        alert('Failed to save changes')
      }
    } catch (error) {
      alert('Error saving product')
    } finally {
      setSavingInline(false)
    }
  }

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products
    .filter(p => filterCategory === "all" || p.category === filterCategory)
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-0.5 text-sm">{products.length} total products</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: products.length, color: 'blue', icon: ShoppingBag },
          { label: 'Categories', value: categories.length - 1, color: 'purple', icon: Filter },
          { label: 'On Amazon', value: products.filter(p => p.amazon_link).length, color: 'orange', icon: ExternalLink },
          { label: 'On Flipkart', value: products.filter(p => p.flipkart_link).length, color: 'blue', icon: ExternalLink },
        ].map((s, i) => (
          <Card key={i} className={`border border-${s.color}-200 bg-${s.color}-50 rounded-2xl`}>
            <CardContent className="p-4">
              <p className={`text-xs text-${s.color}-600 font-semibold mb-1`}>{s.label}</p>
              <p className={`text-2xl font-black text-${s.color}-700`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Product Form */}
      {showForm && (
        <Card className="border border-blue-200 bg-blue-50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">New Product</h2>
              <button
                onClick={() => setShowForm(false)}
                title="Close form"
                aria-label="Close form"
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Product name" className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label>Category *</Label>
                <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Electronics, Fashion..." className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." className="mt-1 rounded-xl" />
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 mt-2" />
                )}
              </div>
              <div>
                <Label>Amazon Affiliate Link</Label>
                <Input value={form.amazon_link} onChange={e => setForm({...form, amazon_link: e.target.value})} placeholder="https://amazon.in/...?tag=YOUR_ID" className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label>Flipkart Affiliate Link</Label>
                <Input value={form.flipkart_link} onChange={e => setForm({...form, flipkart_link: e.target.value})} placeholder="https://flipkart.com/...?affid=YOUR_ID" className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label>Quality Score (1-10)</Label>
                <Input type="number" min="1" max="10" value={form.quality_score} onChange={e => setForm({...form, quality_score: e.target.value})} className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label>Popularity Score (1-10)</Label>
                <Input type="number" min="1" max="10" value={form.popularity_score} onChange={e => setForm({...form, popularity_score: e.target.value})} className="mt-1 rounded-xl" />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Product description" className="mt-1 rounded-xl" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={createProduct} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                {submitting ? 'Adding...' : 'Add Product'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          title="Filter by category"
          aria-label="Filter by category"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-700"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
          ))}
        </select>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading products...</div>
      ) : filtered.length === 0 ? (
        <Card className="border border-dashed border-gray-300 rounded-2xl">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 text-sm">{search ? 'Try a different search' : 'Add your first product above!'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(product => {
            const isEditing = inlineEditId === product.id
            return (
              <Card key={product.id} className={`border rounded-2xl transition-all ${isEditing ? 'border-blue-300 bg-blue-50/30 shadow-md' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
                <CardContent className="p-5">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-blue-700 text-sm">Editing: {product.name}</p>
                        <button
                          onClick={() => setInlineEditId(null)}
                          title="Cancel edit"
                          aria-label="Cancel edit"
                          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          <X className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Name</Label>
                          <Input value={inlineForm.name || ''} onChange={e => setInlineForm(p => ({...p, name: e.target.value}))} className="mt-1 h-9 text-sm rounded-lg" />
                        </div>
                        <div>
                          <Label className="text-xs">Price (₹)</Label>
                          <Input type="number" value={inlineForm.price || ''} onChange={e => setInlineForm(p => ({...p, price: parseFloat(e.target.value)}))} className="mt-1 h-9 text-sm rounded-lg" />
                        </div>
                        <div>
                          <Label className="text-xs">Category</Label>
                          <Input value={inlineForm.category || ''} onChange={e => setInlineForm(p => ({...p, category: e.target.value}))} className="mt-1 h-9 text-sm rounded-lg" />
                        </div>
                        <div>
                          <Label className="text-xs">Amazon Link</Label>
                          <Input value={inlineForm.amazon_link || ''} onChange={e => setInlineForm(p => ({...p, amazon_link: e.target.value}))} className="mt-1 h-9 text-sm rounded-lg" placeholder="https://amazon.in/..." />
                        </div>
                        <div>
                          <Label className="text-xs">Flipkart Link</Label>
                          <Input value={inlineForm.flipkart_link || ''} onChange={e => setInlineForm(p => ({...p, flipkart_link: e.target.value}))} className="mt-1 h-9 text-sm rounded-lg" placeholder="https://flipkart.com/..." />
                        </div>
                        <div>
                          <Label className="text-xs">Image URL</Label>
                          <Input value={inlineForm.image_url || ''} onChange={e => setInlineForm(p => ({...p, image_url: e.target.value}))} className="mt-1 h-9 text-sm rounded-lg" />
                        </div>
                        <div className="md:col-span-3">
                          <Label className="text-xs">Description</Label>
                          <Input value={inlineForm.description || ''} onChange={e => setInlineForm(p => ({...p, description: e.target.value}))} className="mt-1 h-9 text-sm rounded-lg" />
                        </div>
                        <div>
                          <Label className="text-xs">Quality (1-10)</Label>
                          <Input type="number" min="1" max="10" value={inlineForm.quality_score || 5} onChange={e => setInlineForm(p => ({...p, quality_score: parseInt(e.target.value)}))} className="mt-1 h-9 text-sm rounded-lg" />
                        </div>
                        <div>
                          <Label className="text-xs">Popularity (1-10)</Label>
                          <Input type="number" min="1" max="10" value={inlineForm.popularity_score || 5} onChange={e => setInlineForm(p => ({...p, popularity_score: parseInt(e.target.value)}))} className="mt-1 h-9 text-sm rounded-lg" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => saveInlineEdit(product.id)} disabled={savingInline} className="bg-blue-600 hover:bg-blue-700 rounded-xl h-9">
                          <Save className="w-4 h-4 mr-1.5" />
                          {savingInline ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={() => setInlineEditId(null)} className="rounded-xl h-9">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-7 h-7 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-sm">{product.name}</h3>
                          <Badge className="bg-gray-100 text-gray-600 text-xs">{product.category}</Badge>
                        </div>
                        {product.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-sm font-black text-gray-900">₹{Number(product.price).toLocaleString()}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.round(product.quality_score / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          {product.amazon_link && (
                            <a href={product.amazon_link} target="_blank" rel="noopener noreferrer"
                              title="View on Amazon"
                              aria-label="View on Amazon"
                              className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold hover:bg-orange-200 flex items-center gap-1">
                              <ExternalLink className="w-2.5 h-2.5" /> Amazon
                            </a>
                          )}
                          {product.flipkart_link && (
                            <a href={product.flipkart_link} target="_blank" rel="noopener noreferrer"
                              title="View on Flipkart"
                              aria-label="View on Flipkart"
                              className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold hover:bg-blue-200 flex items-center gap-1">
                              <ExternalLink className="w-2.5 h-2.5" /> Flipkart
                            </a>
                          )}
                          {!product.amazon_link && !product.flipkart_link && (
                            <span className="text-xs text-red-400 italic">⚠ No affiliate links</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => startInlineEdit(product)}
                          title="Edit product" aria-label="Edit product"
                          className="text-blue-600 hover:bg-blue-50 rounded-xl h-9 px-3">
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteProduct(product.id)}
                          title="Delete product" aria-label="Delete product"
                          className="text-red-500 hover:bg-red-50 rounded-xl h-9 px-3">
                          <Trash2 className="w-4 h-4" />
                        </Button>
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