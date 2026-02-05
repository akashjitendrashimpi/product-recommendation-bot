"use client"

import { useState } from "react"
import type { Product, QRCampaign, Category, UserProfile, Task } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Package, LogOut, Users, LayoutDashboard, CheckSquare } from "lucide-react"
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
import { UsersTab } from "./users-tab"
import { AdminProductsTab } from "./admin-products-tab"
import { AdminCampaignsTab } from "./admin-campaigns-tab"
import { AdminTasksTab } from "./admin-tasks-tab"

interface AdminPanelProps {
  currentUser: { id: number; email: string }
  currentProfile: UserProfile
  users: UserProfile[]
  allProducts: Product[]
  allCampaigns: QRCampaign[]
  categories: Category[]
  allTasks: Task[]
}

export function AdminPanel({
  currentUser,
  currentProfile,
  users,
  allProducts,
  allCampaigns,
  categories,
  allTasks,
}: AdminPanelProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>(allProducts)
  const [campaigns, setCampaigns] = useState<QRCampaign[]>(allCampaigns)
  const [tasks, setTasks] = useState<Task[]>(allTasks)
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

  const initials = currentProfile?.display_name
    ? currentProfile.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "A"

  const selectedUser = selectedUserId ? users.find((u) => u.id === selectedUserId) : null
  const filteredProducts = selectedUserId ? products.filter((p) => p.user_id === selectedUserId) : products
  const filteredCampaigns = selectedUserId ? campaigns.filter((c) => c.user_id === selectedUserId) : campaigns

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center">
                <QrCode className="w-5 h-5 text-destructive-foreground" />
              </div>
              <span className="font-semibold text-lg">Admin Panel</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden md:flex gap-4">
              <span>{users.length} Users</span>
              <span>{products.length} Products</span>
              <span>{campaigns.length} Campaigns</span>
              <span>{tasks.length} Tasks</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-destructive text-destructive-foreground">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentProfile?.display_name || "Admin"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
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
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedUser
              ? `Viewing ${selectedUser.display_name || selectedUser.email}'s data`
              : "Manage all users, products, and campaigns"}
          </p>
          {selectedUser && (
            <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={() => setSelectedUserId(null)}>
              Clear filter - View all
            </Button>
          )}
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Products {selectedUser && `(${filteredProducts.length})`}
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <QrCode className="w-4 h-4" />
              Campaigns {selectedUser && `(${filteredCampaigns.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <AdminTasksTab tasks={tasks} setTasks={setTasks} />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab users={users} onSelectUser={setSelectedUserId} selectedUserId={selectedUserId} />
          </TabsContent>

          <TabsContent value="products">
            <AdminProductsTab
              products={filteredProducts}
              setProducts={setProducts}
              categories={categories}
              users={users}
              selectedUserId={selectedUserId}
            />
          </TabsContent>

          <TabsContent value="campaigns">
            <AdminCampaignsTab
              campaigns={filteredCampaigns}
              setCampaigns={setCampaigns}
              users={users}
              selectedUserId={selectedUserId}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
