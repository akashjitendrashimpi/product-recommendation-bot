import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Sparkles, CheckCircle2, ArrowRight, Clock } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-2 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Qyantra
            </span>
          </Link>

          <Card className="border-2 border-gray-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              {/* Success Icon */}
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-green-500 animate-ping opacity-20"></div>
                <CheckCircle2 className="w-10 h-10 text-green-600 relative z-10" />
              </div>

              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3">
                Account Created! 🎉
              </CardTitle>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                Welcome to Qyantra! We've sent a verification link to your email address.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Email Verification Steps */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Check Your Inbox</p>
                    <p className="text-xs text-gray-600">We sent a verification email. Click the link to activate your account.</p>
                  </div>
                </div>

                <div className="space-y-2 ml-13">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                    <p className="text-xs text-gray-600">Check your spam folder if you don't see it</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></span>
                    <p className="text-xs text-gray-600">Verification link expires in 24 hours</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                    <p className="text-xs text-gray-600">After verification, you can sign in immediately</p>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="p-4 rounded-lg bg-white border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-3">What's waiting for you:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">AI-powered product recommendations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">Daily earning opportunities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">Instant UPI payouts</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  asChild 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/auth/login" className="flex items-center gap-2">
                    Go to Sign In
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>

                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full h-11 text-base border-2 border-gray-200 hover:bg-gray-50"
                >
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>

              {/* Resend Link */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Didn't receive the email?{" "}
                  <button className="text-blue-600 hover:text-green-600 font-medium underline underline-offset-2 transition-colors">
                    Resend verification link
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Need help? Contact support@qyantra.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}