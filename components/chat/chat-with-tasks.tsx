"use client";

import { useState, useEffect, useRef } from "react"
import type { Product, QRCampaign, Category, ChatStep } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, ShoppingBag, ArrowRight, RotateCcw, ExternalLink, Store, CheckSquare, LogIn, UserPlus } from "lucide-react"
import { TasksTab } from "@/components/dashboard/tasks-tab"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ProfileMenu } from "@/components/shared/profile-menu"

interface SessionUser {
  id: number
  email: string
  display_name: string | null
  is_admin: boolean
}


interface ChatWithTasksProps {
  campaign: QRCampaign | null
  products: Product[]
  categories: Category[]
  user?: { display_name: string | null; phone: string | null } | null
}

const BUDGET_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 - ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 - ₹5,000", min: 2500, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: Number.POSITIVE_INFINITY },
]

const PREFERENCE_OPTIONS = [
  { label: "Best Quality", value: "quality" },
  { label: "Most Popular", value: "popularity" },
  { label: "Best Value", value: "value" },
]

export function ChatWithTasks({ campaign, products, categories, user }: ChatWithTasksProps) {
  const pathname = usePathname()
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<{
    category?: string
    budget?: { min: number; max: number }
    preference?: string
  }>({})
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)

  // Track if we've already incremented the scan count for this visit
  const hasIncremented = useRef(false)

  // Get user ID from session (if logged in) - check periodically for login
  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile")
      const data = await res.json()
      setSessionUser(data.user ?? null)
    } catch {
      setSessionUser(null)
    }
  }

  fetchProfile()
  const interval = setInterval(fetchProfile, 2000)
  return () => clearInterval(interval)
}, [])


  // Increment scan count only once when component mounts
  useEffect(() => {
    if (campaign && campaign.id && !hasIncremented.current) {
      hasIncremented.current = true
      fetch(`/api/campaigns/${campaign.id}/increment-scan`, {
        method: "POST",
      }).catch((error) => {
        console.error("Failed to increment scan count:", error)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty array - only run once on mount

  const availableCategories = categories.filter((cat) => products.some((p) => p.category === cat.name))

  const steps: ChatStep[] = [
    {
      id: "category",
      question: "What type of product are you looking for?",
      options: availableCategories.map((cat) => ({ label: cat.name, value: cat.name })),
      field: "category",
    },
    {
      id: "budget",
      question: "What's your budget range?",
      options: BUDGET_RANGES.map((range, idx) => ({ label: range.label, value: idx.toString() })),
      field: "budget",
    },
    {
      id: "preference",
      question: "What matters most to you?",
      options: PREFERENCE_OPTIONS,
      field: "preference",
    },
  ]

  const handleSelection = (value: string) => {
    const currentStepData = steps[currentStep]

    if (currentStepData.field === "category") {
      setSelections((prev) => ({ ...prev, category: value }))
    } else if (currentStepData.field === "budget") {
      setSelections((prev) => ({ ...prev, budget: BUDGET_RANGES[Number.parseInt(value)] }))
    } else if (currentStepData.field === "preference") {
      setSelections((prev) => ({ ...prev, preference: value }))
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      // Calculate recommendations
      generateRecommendations({ ...selections, preference: value })
    }
  }

  const generateRecommendations = (finalSelections: typeof selections) => {
    let filtered = products

    // Filter by category
    if (finalSelections.category) {
      filtered = filtered.filter((p) => p.category === finalSelections.category)
    }

    // Filter by budget
    if (finalSelections.budget) {
      filtered = filtered.filter(
        (p) => p.price >= finalSelections.budget!.min && p.price <= finalSelections.budget!.max,
      )
    }

    // Sort by preference
    if (finalSelections.preference === "quality") {
      filtered.sort((a, b) => b.quality_score - a.quality_score)
    } else if (finalSelections.preference === "popularity") {
      filtered.sort((a, b) => b.popularity_score - a.popularity_score)
    } else if (finalSelections.preference === "value") {
      filtered.sort((a, b) => {
        const aScore = (a.quality_score + a.popularity_score) / a.price
        const bScore = (b.quality_score + b.popularity_score) / b.price
        return bScore - aScore
      })
    }

    setRecommendations(filtered.slice(0, 3))
  }

  const resetChat = () => {
    setCurrentStep(0)
    setSelections({})
    setRecommendations([])
  }

  const isComplete = recommendations.length > 0 || (currentStep === steps.length - 1 && selections.preference)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">QrBot</span>
          </div>

          {sessionUser ? (
    <ProfileMenu user={{ id: sessionUser.id, email: sessionUser.email }} profile={{ display_name: sessionUser.display_name, is_admin: sessionUser.is_admin,}}/>) : (

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/auth/login?return=${encodeURIComponent(pathname)}`}>
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/auth/sign-up?return=${encodeURIComponent(pathname)}`}>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-muted w-full">
            <TabsTrigger value="products" className="gap-2 flex-1">
              <ShoppingBag className="w-4 h-4" />
              Product Recommendations
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2 flex-1">
              <CheckSquare className="w-4 h-4" />
              Daily Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Welcome Message */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Welcome to QrBot!
                </CardTitle>
                <CardDescription>
                  {products.length > 0
                    ? "Answer a few questions and I'll recommend the perfect products for you."
                    : "No products available at the moment. Please check back later!"}
                </CardDescription>
              </CardHeader>
              {products.length > 0 && (
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="w-4 h-4" />
                    <span>{products.length} products available</span>
                  </div>
                </CardContent>
              )}
            </Card>

            {products.length > 0 && (
              <>
                {/* Chat Steps */}
                {steps.slice(0, currentStep + 1).map((step, idx) => (
                  <div key={step.id} className="space-y-3">
                    <Card>
                      <CardContent className="pt-4">
                        <p className="font-medium mb-4">{step.question}</p>
                        <div className="flex flex-wrap gap-2">
                          {step.options.map((option) => {
                            const isSelected =
                              (step.field === "category" && selections.category === option.value) ||
                              (step.field === "budget" &&
                                selections.budget === BUDGET_RANGES[Number.parseInt(option.value)]) ||
                              (step.field === "preference" && selections.preference === option.value)

                            return (
                              <Button
                                key={option.value}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => idx === currentStep && handleSelection(option.value)}
                                disabled={idx !== currentStep && !isSelected}
                                className="gap-1"
                              >
                                {option.label}
                                {idx === currentStep && !isSelected && <ArrowRight className="w-3 h-3" />}
                              </Button>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-4">
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle>Here are my top recommendations for you!</CardTitle>
                    <CardDescription>
                      Based on your preferences, I found {recommendations.length} great options.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {recommendations.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {product.image_url && (
                        <div className="sm:w-32 h-32 bg-muted flex-shrink-0">
                          <img
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                          <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
                        </div>

                        {product.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            Quality: {product.quality_score}/10
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Popularity: {product.popularity_score}/10
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          {product.amazon_link && (
                            <Button size="sm" className="gap-1 bg-orange-500 hover:bg-orange-600 text-white" asChild>
                              <a href={product.amazon_link} target="_blank" rel="noopener noreferrer">
                                Buy on Amazon
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                          {product.flipkart_link && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-blue-500 text-blue-500 hover:bg-blue-50 bg-transparent"
                              asChild
                            >
                              <a href={product.flipkart_link} target="_blank" rel="noopener noreferrer">
                                Buy on Flipkart
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {recommendations.length === 0 && currentStep === steps.length && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="pt-4 text-center">
                  <p className="text-muted-foreground">
                    No products found matching your criteria. Try different options!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reset Button */}
            {(isComplete || currentStep > 0) && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={resetChat} className="gap-2 bg-transparent">
                  <RotateCcw className="w-4 h-4" />
                  Start Over
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks">
            {sessionUser ? ( <TasksTab userId={sessionUser.id} /> ) : (

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5" />
                    Daily Tasks
                  </CardTitle>
                  <CardDescription>
                    Sign in to view and complete tasks. Earn money by completing app installs and other offers!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link href={`/auth/login?return=${encodeURIComponent(pathname)}`}>
                        Sign In
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/auth/sign-up?return=${encodeURIComponent(pathname)}`}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      After signing in, you'll be able to:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                      <li>View available tasks and offers</li>
                      <li>Complete tasks to earn money</li>
                      <li>Track your earnings and request payouts</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
