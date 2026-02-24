import { verifyEmailToken } from "@/lib/db/email-tokens"
import Link from "next/link"
import { CheckCircle2, XCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    return <ErrorState message="No verification token provided" />
  }

  try {
    const userId = await verifyEmailToken(token)

    if (!userId) {
      return <ErrorState message="Invalid or expired verification token" />
    }

    return <SuccessState />
  } catch (error) {
    console.error("Email verification error:", error)
    return <ErrorState message="Failed to verify email" />
  }
}

function SuccessState() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center justify-center gap-2 mb-2 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Qyantra
            </span>
          </Link>

          <Card className="border-2 border-green-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-600">
                Email Verified!
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-2">
                Your account has been successfully activated
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-gray-700 text-center">
                  You can now sign in and access all features
                </p>
              </div>

              <Link href="/auth/login?verified=true">
                <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg">
                  Go to Sign In
                </Button>
              </Link>

              <Link href="/" className="block">
                <Button variant="outline" className="w-full h-12 text-base">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center justify-center gap-2 mb-2 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Qyantra
            </span>
          </Link>

          <Card className="border-2 border-red-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-red-600">
                Verification Failed
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-2">
                {message}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-gray-700 text-center">
                  The verification link may have expired or is invalid
                </p>
              </div>

              <Link href="/auth/sign-up">
                <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg">
                  Sign Up Again
                </Button>
              </Link>

              <Link href="/" className="block">
                <Button variant="outline" className="w-full h-12 text-base">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}