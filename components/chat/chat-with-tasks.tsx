"use client";

import { useState, useEffect, useRef } from "react"
import type { Product, QRCampaign, Category, ChatStep } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TasksTab } from "@/components/dashboard/tasks-tab"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ProfileMenu } from "@/components/shared/profile-menu"
import {
  QrCode, ShoppingBag, CheckSquare, LogIn, UserPlus,
  ArrowRight, RotateCcw, ExternalLink, Sparkles, ChevronRight
} from "lucide-react"

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
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 – ₹5,000", min: 2500, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: Number.POSITIVE_INFINITY },
]

const PREFERENCE_OPTIONS = [
  { label: "⭐ Best Quality", value: "quality" },
  { label: "🔥 Most Popular", value: "popularity" },
  { label: "💰 Best Value", value: "value" },
]

export function ChatWithTasks({ campaign, products, categories, user }: ChatWithTasksProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<'products' | 'tasks'>('products')
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<{
    category?: string
    budget?: { min: number; max: number }
    preference?: string
  }>({})
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
  const hasIncremented = useRef(false)

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

  useEffect(() => {
    if (campaign && campaign.id && !hasIncremented.current) {
      hasIncremented.current = true
      fetch(`/api/campaigns/${campaign.id}/increment-scan`, { method: "POST" }).catch(console.error)
    }
  }, [])

  const availableCategories = categories.filter((cat) => products.some((p) => p.category === cat.name))

  const steps: ChatStep[] = [
    {
      id: "category",
      question: "What are you shopping for today?",
      options: availableCategories.map((cat) => ({ label: cat.name, value: cat.name })),
      field: "category",
    },
    {
      id: "budget",
      question: "What's your budget?",
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
      generateRecommendations({ ...selections, preference: value })
    }
  }

  const generateRecommendations = (finalSelections: typeof selections) => {
    let filtered = products
    if (finalSelections.category) {
      filtered = filtered.filter((p) => p.category === finalSelections.category)
    }
    if (finalSelections.budget) {
      filtered = filtered.filter(
        (p) => p.price >= finalSelections.budget!.min && p.price <= finalSelections.budget!.max
      )
    }
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

  const isComplete = recommendations.length > 0

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 50%, #f0fdf4 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg">Qyantra</span>
              {campaign && (
                <span className="block text-xs text-blue-600 font-medium">{campaign.campaign_name}</span>
              )}
            </div>
          </div>

          {sessionUser ? (
            <ProfileMenu user={{ id: sessionUser.id, email: sessionUser.email }} profile={{ display_name: sessionUser.display_name, is_admin: sessionUser.is_admin }} />
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="border-gray-200">
                <Link href={`/auth/login?return=${encodeURIComponent(pathname)}`}>
                  <LogIn className="w-4 h-4 mr-1" /> Sign In
                </Link>
              </Button>
              <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href={`/auth/sign-up?return=${encodeURIComponent(pathname)}`}>
                  <UserPlus className="w-4 h-4 mr-1" /> Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'products'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Product Finder
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'tasks'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Earn Money
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            {/* Welcome */}
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Product</h1>
              <p className="text-gray-500 text-sm">
                {products.length > 0
                  ? `Answer 3 quick questions — I'll match you from ${products.length} products`
                  : "No products available right now. Check back soon!"}
              </p>
            </div>

            {products.length > 0 && !isComplete && (
              <>
                {/* Progress */}
                <div className="flex items-center gap-2 px-1">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        idx < currentStep ? 'bg-blue-600' :
                        idx === currentStep ? 'bg-blue-300' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Chat Steps */}
                {steps.slice(0, currentStep + 1).map((step, idx) => (
                  <div key={step.id} className={`${idx < currentStep ? 'opacity-60' : ''}`}>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <p className="font-semibold text-gray-900">{step.question}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {step.options.map((option) => {
                          const isSelected =
                            (step.field === "category" && selections.category === option.value) ||
                            (step.field === "budget" && selections.budget === BUDGET_RANGES[Number.parseInt(option.value)]) ||
                            (step.field === "preference" && selections.preference === option.value)
                          return (
                            <button
                              key={option.value}
                              onClick={() => idx === currentStep && handleSelection(option.value)}
                              disabled={idx !== currentStep}
                              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                                  : idx === currentStep
                                  ? 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                  : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                              }`}
                            >
                              {option.label}
                              {idx === currentStep && !isSelected && (
                                <ChevronRight className="w-3 h-3 inline ml-1" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Recommendations */}
            {isComplete && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5" />
                    <h2 className="font-bold text-lg">Your Top Picks!</h2>
                  </div>
                  <p className="text-blue-100 text-sm">
                    Found {recommendations.length} perfect match{recommendations.length !== 1 ? 'es' : ''} for you
                  </p>
                </div>

                {recommendations.map((product, idx) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex">
                      {product.image_url && (
                        <div className="w-28 h-28 flex-shrink-0 bg-gray-50">
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            {idx === 0 && (
                              <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full mb-1 inline-block">
                                🏆 Best Match
                              </span>
                            )}
                            <h3 className="font-bold text-gray-900">{product.name}</h3>
                            <p className="text-xs text-gray-500">{product.category}</p>
                          </div>
                          <span className="text-xl font-black text-blue-600 flex-shrink-0">
                            ₹{product.price.toLocaleString()}
                          </span>
                        </div>
                        {product.description && (
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                        )}
                        <div className="flex gap-2">
                          {product.amazon_link && (
                            <a href={product.amazon_link} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                              Amazon <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {product.flipkart_link && (
                            <a href={product.flipkart_link} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors">
                              Flipkart <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {recommendations.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <p className="text-gray-500">No products found. Try different options!</p>
                  </div>
                )}

                <button onClick={resetChat}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  <RotateCcw className="w-4 h-4" /> Start Over
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            {sessionUser ? (
              <TasksTab userId={sessionUser.id} />
            ) : (
              <div className="space-y-5">
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                    <CheckSquare className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Earn Real Money</h2>
                  <p className="text-gray-500 text-sm">Complete simple tasks and get paid directly to your UPI</p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: '📱', label: 'Install Apps', desc: 'Earn per install' },
                    { icon: '✅', label: 'Simple Tasks', desc: 'Easy to complete' },
                    { icon: '💸', label: 'UPI Payout', desc: 'Direct to bank' },
                  ].map((f) => (
                    <div key={f.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                      <div className="text-2xl mb-2">{f.icon}</div>
                      <p className="text-xs font-bold text-gray-900">{f.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold rounded-xl">
                    <Link href={`/auth/login?return=${encodeURIComponent(pathname)}`}>
                      <LogIn className="w-5 h-5 mr-2" /> Sign In to Start Earning
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full h-12 text-base rounded-xl border-gray-200">
                    <Link href={`/auth/sign-up?return=${encodeURIComponent(pathname)}`}>
                      <UserPlus className="w-5 h-5 mr-2" /> Create Free Account
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}