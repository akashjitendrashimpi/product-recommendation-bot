"use client"

import { useState } from "react"
import type { Product, QRCampaign, Category, UserProfile } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsTab } from "./products-tab"
import { CampaignsTab } from "./campaigns-tab"
import { TasksTab } from "./tasks-tab"
import { QrCode, Package, LogOut, Shield, UserIcon, CheckSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface userDashboardProps {
  user: { id: number; email: string }
  profile: UserProfile | null
  initialProducts: Product[]
  initialCampaigns: QRCampaign[]
  categories: Category[]
}

export function userDashboard({
  user,
  profile,
  initialProducts,
  initialCampaigns,
  categories,
}: userDashboardProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [campaigns, setCampaigns] = useState<QRCampaign[]>(initialCampaigns)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    router.push("/auth/login")
    }
  }

  const initials = profile?.display_name
    ? profile.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0].toUpperCase() || "U"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">QrBot</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden md:flex gap-4">
              <span>{products.length} Products</span>
              <span>{campaigns.length} Campaigns</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.display_name || "user"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    {profile?.phone && profile.phone.trim() !== "" && (
                      <p className="text-xs leading-none text-muted-foreground">{profile.phone}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {profile?.is_admin === true && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome, {profile?.display_name || "User"}</h1>
          <p className="text-muted-foreground">Complete tasks, manage products, and track your earnings</p>
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              Daily Tasks
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <QrCode className="w-4 h-4" />
              QR Campaigns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <TasksTab userId={user.id} />
          </TabsContent>

          <TabsContent value="products">
            <ProductsTab products={products} setProducts={setProducts} categories={categories} userId={user.id} />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignsTab campaigns={campaigns} setCampaigns={setCampaigns} userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
