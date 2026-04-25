"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, ImagePlus, Wallet, X, ArrowRight } from "lucide-react"

export function OnboardingFlow() {
  const [minPayout, setMinPayout] = useState(50)
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    // TODO: Move onboarding tracking to the database when user profile expands
    const hasSeen = localStorage.getItem("qyantra_onboarding_v1")
    if (!hasSeen) {
      // Fetch dynamic min payout before showing
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data?.min_payout) {
            setMinPayout(Number(data.min_payout))
          }
          setShow(true)
        })
        .catch(() => {
          // Fallback if API fails
          setShow(true)
        })
    }
  }, [])

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      finishOnboarding()
    }
  }

  const finishOnboarding = () => {
    setShow(false)
    localStorage.setItem("qyantra_onboarding_v1", "true")
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex gap-1.5 ml-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-blue-600" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>
          <button 
            onClick={finishOnboarding}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Slides */}
        <div className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center relative">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Search className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">1. Find Tasks</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Browse our daily updated task list. Install apps, write reviews, or complete surveys that fit your interests.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ImagePlus className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">2. Submit Proof</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Follow the precise instructions in the task details, take a screenshot of completion, and upload it for review.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                  ₹{minPayout} Min
                </div>
                <Wallet className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">3. Get Paid</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Once reviewed, earnings hit your balance. Withdraw directly to Paytm, GPay, or PhonePe when you reach ₹{minPayout}.
              </p>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-6 bg-gray-50 flex items-center justify-between border-t border-gray-100">
          <Button 
            variant="ghost" 
            className="text-gray-500 font-semibold"
            onClick={finishOnboarding}
          >
            Skip tutorial
          </Button>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 font-bold rounded-xl px-6 h-11"
            onClick={handleNext}
          >
            {step === 3 ? "Let's Earn!" : "Next"} 
            {step < 3 && <ArrowRight className="w-4 h-4 ml-1.5" />}
          </Button>
        </div>

      </div>
    </div>
  )
}
