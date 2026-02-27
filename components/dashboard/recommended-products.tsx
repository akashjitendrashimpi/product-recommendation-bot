"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingBag, ArrowRight } from "lucide-react"
import type { Product } from "@/lib/types"

interface RecommendedProductsProps {
  products?: Product[]
}

const sampleProducts: Product[] = [
  {
    id: 1,
    product_id: "P1001",
    name: "Wireless Headphones",
    category: "Electronics",
    price: 1299,
    image_url: null,
    description: "Comfortable over-ear wireless headphones",
    amazon_link: null,
    flipkart_link: null,
    quality_score: 88,
    popularity_score: 74,
    user_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    product_id: "P1002",
    name: "Reusable Water Bottle",
    category: "Home",
    price: 499,
    image_url: null,
    description: "Insulated stainless steel bottle",
    amazon_link: null,
    flipkart_link: null,
    quality_score: 92,
    popularity_score: 81,
    user_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function RecommendedProducts({ products }: RecommendedProductsProps) {
  const items = products ?? sampleProducts

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <Card key={p.id} className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">{p.name}</CardTitle>
              <CardDescription className="text-xs text-gray-500">{p.category}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3 justify-between">
              <div>
                <p className="text-sm text-gray-700">₹{p.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-green-50 text-green-700">Q {p.quality_score}</Badge>
                  <Badge className="bg-blue-50 text-blue-700">P {p.popularity_score}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="#" className="hidden sm:inline">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Star className="w-4 h-4" /> Promote
                  </Button>
                </Link>
                <Link href="#" className="ml-1">
                  <Button size="sm" className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
