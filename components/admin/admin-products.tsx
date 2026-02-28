"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Trash2, X, Package } from "lucide-react"

interface Product {
  id: number
  product_id: string
  name: string
  category: string
  price: number
  amazon_link: string | null
  flipkart_link: string | null
  quality_score: number
  is_active: boolean
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', category: '', price: '',
    description: '', image_url: '',
    amazon_link: '', flipkart_link: '',
    quality_score: '8', popularity_score: '5'
  })

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
        setForm({ name: '', category: '', price: '', description: '', image_url: '', amazon_link: '', flipkart_link: '', quality_score: '8', popularity_score: '5' })
        fetchProducts()
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

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">{products.length} total products</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Product</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Product name" className="mt-1" />
              </div>
              <div>
                <Label>Category *</Label>
                <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Electronics, Fashion..." className="mt-1" />
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." className="mt-1" />
              </div>
              <div>
                <Label>Amazon Link</Label>
                <Input value={form.amazon_link} onChange={e => setForm({...form, amazon_link: e.target.value})} placeholder="https://amazon.in/..." className="mt-1" />
              </div>
              <div>
                <Label>Flipkart Link</Label>
                <Input value={form.flipkart_link} onChange={e => setForm({...form, flipkart_link: e.target.value})} placeholder="https://flipkart.com/..." className="mt-1" />
              </div>
              <div>
                <Label>Quality Score (1-10)</Label>
                <Input type="number" min="1" max="10" value={form.quality_score} onChange={e => setForm({...form, quality_score: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>Popularity Score (1-10)</Label>
                <Input type="number" min="1" max="10" value={form.popularity_score} onChange={e => setForm({...form, popularity_score: e.target.value})} className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Product description" className="mt-1" />
              </div>
            </div>
            <Button onClick={createProduct} disabled={submitting} className="mt-4 bg-blue-600 hover:bg-blue-700">
              {submitting ? 'Adding...' : 'Add Product'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading products...</div>
      ) : filtered.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No products yet. Add one above!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <Card key={product.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="secondary" className="text-xs mb-2">{product.category}</Badge>
                    <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                    <p className="text-lg font-bold text-gray-900 mt-1">₹{product.price.toLocaleString()}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>Quality: {product.quality_score}/10</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {product.amazon_link && <Badge className="bg-orange-100 text-orange-700 text-xs">Amazon</Badge>}
                      {product.flipkart_link && <Badge className="bg-blue-100 text-blue-700 text-xs">Flipkart</Badge>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteProduct(product.id)} className="text-red-500 hover:bg-red-50 ml-2">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}