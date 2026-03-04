"use client"

import type React from "react"
import { useState } from "react"
import type { Product, Category, UserProfile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus, Trash2, Edit, ExternalLink, Package, Save, X,
  Search, Star, TrendingUp, ShoppingBag, Filter
} from "lucide-react"

interface AdminProductsTabProps {
  products: Product[]
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  categories: Category[]
  users: UserProfile[]
  selectedUserId: number | null
}

const emptyForm = {
  product_id: "", name: "", category: "", price: "",
  image_url: "", description: "", amazon_link: "", flipkart_link: "",
  quality_score: "5", popularity_score: "5",
}

export function AdminProductsTab({ products, setProducts, categories, users, selectedUserId }: AdminProductsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [inlineEditId, setInlineEditId] = useState<number | null>(null)
  const [inlineForm, setInlineForm] = useState<Partial<Product>>({})
  const [savingInline, setSavingInline] = useState(false)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [formData, setFormData] = useState(emptyForm)

  const resetForm = () => { setFormData(emptyForm); setEditingProduct(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const productData = {
      product_id: formData.product_id,
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      image_url: formData.image_url || null,
      description: formData.description || null,
      amazon_link: formData.amazon_link || null,
      flipkart_link: formData.flipkart_link || null,
      quality_score: parseInt(formData.quality_score),
      popularity_score: parseInt(formData.popularity_score),
    }
    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to update") }
        const { product } = await res.json()
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? product : p))
      } else {
        const res = await fetch("/api/products", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to create") }
        const { product } = await res.json()
        setProducts(prev => [product, ...prev])
      }
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error saving product")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to delete") }
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error deleting product")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      product_id: product.product_id,
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      image_url: product.image_url || "",
      description: product.description || "",
      amazon_link: product.amazon_link || "",
      flipkart_link: product.flipkart_link || "",
      quality_score: product.quality_score.toString(),
      popularity_score: product.popularity_score.toString(),
    })
    setIsDialogOpen(true)
  }

  const startInlineEdit = (product: Product) => {
    setInlineEditId(product.id)
    setInlineForm({
      name: product.name,
      price: product.price,
      category: product.category,
      amazon_link: product.amazon_link || "",
      flipkart_link: product.flipkart_link || "",
      quality_score: product.quality_score,
      popularity_score: product.popularity_score,
      description: product.description || "",
      image_url: product.image_url || "",
    })
  }

  const saveInlineEdit = async (id: number) => {
    setSavingInline(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inlineForm),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to save") }
      const { product } = await res.json()
      setProducts(prev => prev.map(p => p.id === id ? product : p))
      setInlineEditId(null)
      setInlineForm({})
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error saving")
    } finally {
      setSavingInline(false)
    }
  }

  const filtered = products
    .filter(p => filterCategory === "all" || p.category === filterCategory)
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.product_id.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} products · {filtered.length} shown</p>
        </div>

        {!selectedUserId && (
          <Dialog open={isDialogOpen} onOpenChange={open => { setIsDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>Fill in product details and affiliate links</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Product ID *</Label>
                    <Input placeholder="PROD001" value={formData.product_id}
                      onChange={e => setFormData(p => ({ ...p, product_id: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Product Name *</Label>
                    <Input placeholder="Wireless Mouse" value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Price (₹) *</Label>
                    <Input type="number" step="0.01" placeholder="499.00" value={formData.price}
                      onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Image URL</Label>
                  <Input type="url" placeholder="https://example.com/image.jpg" value={formData.image_url}
                    onChange={e => setFormData(p => ({ ...p, image_url: e.target.value }))} />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-gray-200 mt-1" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea placeholder="Product description..." value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} />
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
                  <p className="text-sm font-bold text-gray-700">🔗 Affiliate Links</p>
                  <div className="space-y-1.5">
                    <Label>Amazon Affiliate Link</Label>
                    <Input type="url" placeholder="https://amazon.in/dp/...?tag=YOUR_ID" value={formData.amazon_link}
                      onChange={e => setFormData(p => ({ ...p, amazon_link: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Flipkart Affiliate Link</Label>
                    <Input type="url" placeholder="https://flipkart.com/...?affid=YOUR_ID" value={formData.flipkart_link}
                      onChange={e => setFormData(p => ({ ...p, flipkart_link: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Quality Score (1-10)</Label>
                    <Input type="number" min="1" max="10" value={formData.quality_score}
                      onChange={e => setFormData(p => ({ ...p, quality_score: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Popularity Score (1-10)</Label>
                    <Input type="number" min="1" max="10" value={formData.popularity_score}
                      onChange={e => setFormData(p => ({ ...p, popularity_score: e.target.value }))} />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {isLoading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Products', value: products.length, icon: ShoppingBag, color: 'blue' },
          { label: 'Categories', value: categories.length, icon: Filter, color: 'purple' },
          { label: 'With Amazon', value: products.filter(p => p.amazon_link).length, icon: ExternalLink, color: 'orange' },
          { label: 'With Flipkart', value: products.filter(p => p.flipkart_link).length, icon: ExternalLink, color: 'blue' },
        ].map((s, i) => (
          <Card key={i} className={`border border-${s.color}-200 bg-${s.color}-50 rounded-2xl`}>
            <CardContent className="p-4">
              <p className={`text-xs text-${s.color}-600 font-semibold mb-1`}>{s.label}</p>
              <p className={`text-2xl font-black text-${s.color}-700`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
        title="Filter by category" aria-label="Filter by category"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-700">
          <option value="all">All Categories</option>
          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
        </select>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <Card className="border border-dashed border-gray-300 rounded-2xl">
          <CardContent className="py-16 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 text-sm">{search ? "Try a different search" : "Add your first product above"}</p>
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
                    // Inline Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-blue-700 text-sm">Editing: {product.name}</p>
                        <button onClick={() => setInlineEditId(null)} title="Cancel edit" aria-label="Cancel edit" className="text-gray-400 hover:text-gray-600">
                         <X className="w-4 h-4" />
                    </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Name</Label>
                          <Input value={inlineForm.name || ''} onChange={e => setInlineForm(p => ({ ...p, name: e.target.value }))} className="mt-1 h-9 text-sm rounded-lg" />
                        </div>
                        <div>
                          <Label className="text-xs">Price (₹)</Label>
                          <Input type="number" value={inlineForm.price || ''} onChange={e => setInlineForm(p => ({ ...p, price: parseFloat(e.target.value) }))} className="mt-1 h-9 text-sm rounded-lg" />
                        </div>
                        <div>
                          <Label className="text-xs">Category</Label>
                          <select value={inlineForm.category || ''} onChange={e => setInlineForm(p => ({ ...p, category: e.target.value }))}
                          title="Select category" aria-label="Select category"
                            className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white">
                            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Amazon Link</Label>
                          <Input value={inlineForm.amazon_link || ''} onChange={e => setInlineForm(p => ({ ...p, amazon_link: e.target.value }))} className="mt-1 h-9 text-sm rounded-lg" placeholder="https://amazon.in/..." />
                        </div>
                        <div>
                          <Label className="text-xs">Flipkart Link</Label>
                          <Input value={inlineForm.flipkart_link || ''} onChange={e => setInlineForm(p => ({ ...p, flipkart_link: e.target.value }))} className="mt-1 h-9 text-sm rounded-lg" placeholder="https://flipkart.com/..." />
                        </div>
                        <div>
                          <Label className="text-xs">Image URL</Label>
                          <Input value={inlineForm.image_url || ''} onChange={e => setInlineForm(p => ({ ...p, image_url: e.target.value }))} className="mt-1 h-9 text-sm rounded-lg" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-3">
                          <Label className="text-xs">Description</Label>
                          <Input value={inlineForm.description || ''} onChange={e => setInlineForm(p => ({ ...p, description: e.target.value }))} className="mt-1 h-9 text-sm rounded-lg" />
                        </div>
                        <div>
                          <Label className="text-xs">Quality (1-10)</Label>
                          <Input type="number" min="1" max="10" value={inlineForm.quality_score || 5} onChange={e => setInlineForm(p => ({ ...p, quality_score: parseInt(e.target.value) }))} className="mt-1 h-9 text-sm rounded-lg" />
                        </div>
                        <div>
                          <Label className="text-xs">Popularity (1-10)</Label>
                          <Input type="number" min="1" max="10" value={inlineForm.popularity_score || 5} onChange={e => setInlineForm(p => ({ ...p, popularity_score: parseInt(e.target.value) }))} className="mt-1 h-9 text-sm rounded-lg" />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button onClick={() => saveInlineEdit(product.id)} disabled={savingInline} className="bg-blue-600 hover:bg-blue-700 rounded-xl h-9">
                          <Save className="w-4 h-4 mr-1.5" /> {savingInline ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={() => setInlineEditId(null)} className="rounded-xl h-9">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
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
                        <div className="flex items-start gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-sm">{product.name}</h3>
                          <Badge className="bg-gray-100 text-gray-600 text-xs">{product.category}</Badge>
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{product.product_id}</p>
                        {product.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-sm font-black text-gray-900">₹{Number(product.price).toLocaleString()}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.round(product.quality_score / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            {product.amazon_link && (
                              <a href={product.amazon_link} target="_blank" rel="noopener noreferrer"
                                title="View on Amazon"
                                className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold hover:bg-orange-200 flex items-center gap-1">
                                <ExternalLink className="w-2.5 h-2.5" /> Amazon
                              </a>
                            )}
                            {product.flipkart_link && (
                              <a href={product.flipkart_link} target="_blank" rel="noopener noreferrer"
                                title="View on Flipkart"
                                className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold hover:bg-blue-200 flex items-center gap-1">
                                <ExternalLink className="w-2.5 h-2.5" /> Flipkart
                              </a>
                            )}
                            {!product.amazon_link && !product.flipkart_link && (
                              <span className="text-xs text-gray-400 italic">No affiliate links</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => startInlineEdit(product)}
                          className="text-blue-600 hover:bg-blue-50 rounded-xl h-9 px-3">
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}
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