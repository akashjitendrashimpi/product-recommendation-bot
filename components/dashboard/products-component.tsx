"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search, Star, ExternalLink, Package, TrendingUp,
  ChevronRight, Flame, Tag, ShoppingBag, Filter
} from "lucide-react"

interface Product {
  id: number
  name: string
  category: string
  price: number
  discount_price: number | null
  image_url: string | null
  description: string | null
  amazon_link: string | null
  flipkart_link: string | null
  quality_score: number
  popularity_score: number
  badge: string | null
  is_featured: boolean
  views: number
}

interface Section {
  id: number
  title: string
  subtitle: string | null
  emoji: string
  is_active: boolean
  products: Product[]
}

export function ProductsComponent({ userId }: { userId: number }) {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searching, setSearching] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [sectionsRes, productsRes] = await Promise.all([
        fetch('/api/admin/sections'),
        fetch('/api/products')
      ])
      if (sectionsRes.ok) setSections((await sectionsRes.json()).sections?.filter((s: Section) => s.is_active) || [])
      if (productsRes.ok) setAllProducts((await productsRes.json()).products || [])
    } catch (error) {
      console.error('Error fetching:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ["all", ...new Set(allProducts.map(p => p.category).filter(Boolean))]

  const filteredProducts = allProducts.filter(p => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const isSearching = search.length > 0 || selectedCategory !== "all"

  const getDiscount = (p: Product) => {
    if (!p.discount_price || p.discount_price >= p.price) return null
    return Math.round(((p.price - p.discount_price) / p.price) * 100)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search products, brands, categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-12 h-14 rounded-2xl border-gray-200 shadow-sm text-base focus:border-blue-400 focus:ring-blue-400"
        />
        {search && (
          <button onClick={() => setSearch("")}
            title="Clear search" aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {cat === 'all' ? '🛍️ All' : cat}
          </button>
        ))}
      </div>

      {/* Search Results */}
      {isSearching ? (
        <div>
          <p className="text-sm text-gray-500 mb-4 font-medium">
            {filteredProducts.length} results {search ? `for "${search}"` : ''} {selectedCategory !== 'all' ? `in ${selectedCategory}` : ''}
          </p>
          {filteredProducts.length === 0 ? (
            <Card className="border border-dashed border-gray-300 rounded-2xl">
              <CardContent className="py-16 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm">Try a different search term or category</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onClick={() => router.push(`/dashboard/products/${product.id}`)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Sections */}
          {sections.length === 0 && allProducts.length === 0 ? (
            <Card className="border border-dashed border-gray-300 rounded-2xl">
              <CardContent className="py-16 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-500 text-sm">Products will appear here once admin adds them</p>
              </CardContent>
            </Card>
          ) : (
            sections.map(section => section.products.length > 0 && (
              <div key={section.id} className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{section.emoji}</span>
                    <div>
                      <h2 className="text-xl font-black text-gray-900">{section.title}</h2>
                      {section.subtitle && <p className="text-sm text-gray-500">{section.subtitle}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:text-blue-700"
                  >
                    See all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Products Horizontal Scroll on Mobile, Grid on Desktop */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {section.products.map(product => (
                    <ProductCard key={product.id} product={product} onClick={() => router.push(`/dashboard/products/${product.id}`)} />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* All Products fallback if no sections */}
          {sections.every(s => s.products.length === 0) && allProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-black text-gray-900">All Products</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allProducts.map(product => (
                  <ProductCard key={product.id} product={product} onClick={() => router.push(`/dashboard/products/${product.id}`)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const discount = product.discount_price && product.discount_price < product.price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null

  return (
    <div onClick={onClick} className="cursor-pointer group">
      <Card className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Image */}
          <div className="relative bg-gray-50 aspect-square overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-300" />
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discount && (
                <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              )}
              {product.badge && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {product.badge}
                </span>
              )}
              {product.is_featured && (
                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  ⭐ Featured
                </span>
              )}
            </div>
            {/* Links indicator */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              {product.amazon_link && (
                <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg">A</span>
              )}
              {product.flipkart_link && (
                <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg">F</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-3 flex flex-col flex-1">
            <p className="text-xs text-gray-500 font-medium mb-1">{product.category}</p>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 flex-1 leading-tight">{product.name}</h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.round(product.quality_score / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
              ))}
              <span className="text-xs text-gray-400 ml-1">({product.quality_score})</span>
            </div>

            {/* Price */}
            <div className="mt-2">
              {discount ? (
                <div>
                  <span className="text-lg font-black text-gray-900">₹{Number(product.discount_price).toLocaleString()}</span>
                  <span className="text-xs text-gray-400 line-through ml-1.5">₹{Number(product.price).toLocaleString()}</span>
                </div>
              ) : (
                <span className="text-lg font-black text-gray-900">₹{Number(product.price).toLocaleString()}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}