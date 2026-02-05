import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Package, MessageSquare, ArrowRight } from "lucide-react"
import { getSession } from "@/lib/auth/session"

export default async function HomePage() {
  const session = await getSession()
  const user = session ? { id: session.userId, email: session.email } : null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">QrBot</span>
          </div>
          {user ? (
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-balance">QR-Powered Product Recommendations</h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Create QR codes for your products, let customers scan and get personalized recommendations through an
            interactive chatbot.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Add Products</CardTitle>
              <CardDescription>
                Upload your product catalog with affiliate links from Amazon and Flipkart
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Generate QR</CardTitle>
              <CardDescription>Create unique QR codes for campaigns that link to your chatbot</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Smart Chatbot</CardTitle>
              <CardDescription>Users scan QR and get personalized product recommendations</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex justify-center gap-4 mt-12">
          <Link href={user ? "/dashboard" : "/auth/sign-up"}>
            <Button size="lg" className="gap-2">
              {user ? "Go to Dashboard" : "Get Started"} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/chat/demo">
            <Button size="lg" variant="outline">
              Try Demo Chatbot
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
