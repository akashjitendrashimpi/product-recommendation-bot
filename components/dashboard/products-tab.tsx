"use client"

import type React from "react"
import { useState } from "react"
import type { Product, Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Edit, ExternalLink, Package } from "lucide-react"

interface ProductsTabProps {
  products: Product[]
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  categories: Category[]
  userId: number
}

export function ProductsTab({ products, setProducts, categories, userId }: ProductsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    product_id: "",
    name: "",
    category: "",
    price: "",
    image_url: "",
    description: "",
    amazon_link: "",
    flipkart_link: "",
    quality_score: "5",
    popularity_score: "5",
  })

  const resetForm = () => {
    setFormData({
      product_id: "",
      name: "",
      category: "",
      price: "",
      image_url: "",
      description: "",
      amazon_link: "",
      flipkart_link: "",
      quality_score: "5",
      popularity_score: "5",
    })
    setEditingProduct(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const productData = {
      product_id: formData.product_id,
      name: formData.name,
      category: formData.category,
      price: Number.parseFloat(formData.price),
      image_url: formData.image_url || null,
      description: formData.description || null,
      amazon_link: formData.amazon_link || null,
      flipkart_link: formData.flipkart_link || null,
      quality_score: Number.parseInt(formData.quality_score),
      popularity_score: Number.parseInt(formData.popularity_score),
    }

    try {
      if (editingProduct) {
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to update product")
        }

        const { product } = await response.json()
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? product : p)))
      } else {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to create product")
        }

        const { product } = await response.json()
        setProducts((prev) => [product, ...prev])
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving product:", error)
      alert(error instanceof Error ? error.message : "Error saving product")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete product")
      }

      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Error deleting product:", error)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Your Products</h2>
          <p className="text-muted-foreground">Manage your product catalog with affiliate links</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>Fill in the product details and affiliate links</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_id">Product ID</Label>
                  <Input
                    id="product_id"
                    placeholder="PROD001"
                    value={formData.product_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, product_id: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="Wireless Mouse"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (INR)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="499.00"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amazon_link">Amazon Affiliate Link</Label>
                <Input
                  id="amazon_link"
                  type="url"
                  placeholder="https://amazon.in/?tag=YOUR_AFFILIATE_ID"
                  value={formData.amazon_link}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amazon_link: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flipkart_link">Flipkart Affiliate Link</Label>
                <Input
                  id="flipkart_link"
                  type="url"
                  placeholder="https://flipkart.com/?affid=YOUR_AFFILIATE_ID"
                  value={formData.flipkart_link}
                  onChange={(e) => setFormData((prev) => ({ ...prev, flipkart_link: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quality_score">Quality Score (1-10)</Label>
                  <Input
                    id="quality_score"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.quality_score}
                    onChange={(e) => setFormData((prev) => ({ ...prev, quality_score: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="popularity_score">Popularity Score (1-10)</Label>
                  <Input
                    id="popularity_score"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.popularity_score}
                    onChange={(e) => setFormData((prev) => ({ ...prev, popularity_score: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No products yet. Add your first product to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Scores</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.product_id}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₹{product.price.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      Q:{product.quality_score} P:{product.popularity_score}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.amazon_link && (
                          <a
                            href={product.amazon_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {product.flipkart_link && (
                          <a
                            href={product.flipkart_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
