"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { User, Save, Lock, Mail, Phone, Wallet } from "lucide-react"

interface UserData {
  id: number
  email: string
  display_name: string | null
  upi_id: string | null
  phone: string | null
  is_admin: boolean
}

interface ProfilePageProps {
  user: UserData
}

export function ProfilePage({ user: initialUser }: ProfilePageProps) {
  const [user, setUser] = useState<UserData>(initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: initialUser.display_name || "",
    upi_id: initialUser.upi_id || "",
    phone: initialUser.phone || "",
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setUser(data.user)
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Account Information
            </CardTitle>
            <CardDescription>Your account details and login information</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Email Address
                </Label>
                <Input value={user.email} disabled className="bg-gray-50" />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label className="text-gray-700 font-medium mb-2 block">Account Type</Label>
                <Input
                  value={user.is_admin ? "Administrator" : "User"}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Lock className="h-4 w-4 text-blue-600" />
                <span>To change your password, please contact support</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile and payment details</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="display_name" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Display Name
                </Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData({ ...formData, display_name: e.target.value })
                  }
                  placeholder="Your name"
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="upi_id" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-gray-500" />
                  UPI ID
                </Label>
                <Input
                  id="upi_id"
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  placeholder="yourname@paytm or yourname@upi"
                  className="h-12"
                />
                <p className="text-sm text-gray-600 mt-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  ⚠️ Required for receiving payments from completed tasks
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                  className="h-12"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="h-12 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Save className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}