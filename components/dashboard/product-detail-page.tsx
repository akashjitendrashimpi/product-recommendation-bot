"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Star, ExternalLink, Package, Share2,
  ShoppingCart, Tag, ChevronRight, Check, Eye
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
  specs: Record<string, string> | null
  tags: string[] | null
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [similar, setSimilar] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data.product)
        setSimilar(data.similar || [])
      } else {
        router.push('/dashboard/products')
      }
    } catch {
      router.push('/dashboard/products')
    } finally {
      setLoading(false)
    }
  }

  const shareProduct = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: product?.name, url })
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const discount = product?.discount_price && product.discount_price < product.price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded-xl" />
            <div className="h-6 bg-gray-200 rounded-xl w-1/2" />
            <div className="h-12 bg-gray-200 rounded-xl w-1/3" />
            <div className="h-24 bg-gray-200 rounded-xl" />
            <div className="h-12 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Back Button */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Products
      </button>

      {/* Main Product */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* Image */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-gray-300" />
              </div>
            )}
            {discount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-black px-3 py-1 rounded-full">
                -{discount}% OFF
              </div>
            )}
            {product.is_featured && (
              <div className="absolute top-4 right-4 bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                ⭐ Featured
              </div>
            )}
          </div>

          {/* Views */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 justify-center">
            <Eye className="w-3.5 h-3.5" />
            <span>{product.views || 0} people viewed this</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          {/* Category + Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-gray-100 text-gray-600">{product.category}</Badge>
            {product.badge && <Badge className="bg-blue-600 text-white">{product.badge}</Badge>}
            {product.tags?.map(tag => (
              <Badge key={tag} className="bg-green-100 text-green-700">#{tag}</Badge>
            ))}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(product.quality_score / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{product.quality_score}/10 Quality</span>
            <span className="text-sm text-gray-400">·</span>
            <span className="text-sm text-gray-500">{product.popularity_score}/10 Popularity</span>
          </div>

          {/* Price */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            {discount ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-gray-900">₹{Number(product.discount_price).toLocaleString()}</span>
                  <span className="text-lg text-gray-400 line-through">₹{Number(product.price).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-green-600">You save ₹{(product.price - (product.discount_price || 0)).toLocaleString()}</span>
                  <Badge className="bg-red-500 text-white text-xs">{discount}% OFF</Badge>
                </div>
              </div>
            ) : (
              <span className="text-3xl font-black text-gray-900">₹{Number(product.price).toLocaleString()}</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">About this product</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">Specifications</h3>
              <div className="space-y-1.5">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-500 font-medium">{key}:</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buy Buttons */}
          <div className="space-y-3">
            {product.amazon_link && (
              <a href={product.amazon_link} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full h-13 bg-orange-500 hover:bg-orange-600 rounded-2xl text-base font-bold shadow-lg shadow-orange-200">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Buy on Amazon
                  <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                </Button>
              </a>
            )}
            {product.flipkart_link && (
              <a href={product.flipkart_link} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full h-13 bg-blue-600 hover:bg-blue-700 rounded-2xl text-base font-bold shadow-lg shadow-blue-200">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Buy on Flipkart
                  <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                </Button>
              </a>
            )}
            {!product.amazon_link && !product.flipkart_link && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
                <p className="text-gray-500 text-sm">Purchase links coming soon</p>
              </div>
            )}

            {/* Share */}
            <Button variant="outline" onClick={shareProduct} className="w-full rounded-2xl border-gray-200">
              {copied ? <><Check className="w-4 h-4 mr-2 text-green-600" />Link Copied!</> : <><Share2 className="w-4 h-4 mr-2" />Share Product</>}
            </Button>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similar.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-xl font-black text-gray-900">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map(p => (
              <div key={p.id} onClick={() => router.push(`/dashboard/products/${p.id}`)}
                className="cursor-pointer group">
                <Card className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gray-50 overflow-hidden">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{p.name}</p>
                      <p className="text-sm font-black text-gray-900 mt-1">₹{Number(p.price).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}