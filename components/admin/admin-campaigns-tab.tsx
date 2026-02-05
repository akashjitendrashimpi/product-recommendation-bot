"use client"

import type React from "react"
import { useState } from "react"
import type { QRCampaign, UserProfile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, QrCode, Plus, Download, Copy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { QRCodeDisplay } from "@/components/dashboard/qr-code-display"

interface AdminCampaignsTabProps {
  campaigns: QRCampaign[]
  setCampaigns: React.Dispatch<React.SetStateAction<QRCampaign[]>>
  users: UserProfile[]
  selectedUserId: number | null
}

export function AdminCampaignsTab({ campaigns, setCampaigns, users, selectedUserId }: AdminCampaignsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<QRCampaign | null>(null)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    campaign_name: "",
    campaign_code: "",
    description: "",
    location: "",
  })

  const resetForm = () => {
    setFormData({
      campaign_name: "",
      campaign_code: "",
      description: "",
      location: "",
    })
  }

  const generateCode = () => {
    const code = `QR${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
    setFormData((prev) => ({ ...prev, campaign_code: code }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: formData.campaign_name,
          campaign_code: formData.campaign_code,
          description: formData.description || null,
          location: formData.location || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create campaign")
      }

      const { campaign } = await response.json()
      setCampaigns((prev) => [campaign, ...prev])
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error creating campaign:", error)
      alert(error instanceof Error ? error.message : "Error creating campaign")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return

    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete campaign")
      }

      setCampaigns((prev) => prev.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Error deleting campaign:", error)
      alert(error instanceof Error ? error.message : "Error deleting campaign")
    }
  }

  const toggleActive = async (campaign: QRCampaign) => {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !campaign.is_active }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update campaign")
      }

      const { campaign: updated } = await response.json()
      setCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? updated : c)))
    } catch (error) {
      console.error("Error updating campaign:", error)
      alert(error instanceof Error ? error.message : "Error updating campaign")
    }
  }

  const copyLink = (code: string) => {
    const link = `${window.location.origin}/chat/${code}`
    navigator.clipboard.writeText(link)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const showQRCode = (campaign: QRCampaign) => {
    setSelectedCampaign(campaign)
    setShowQRDialog(true)
  }

  const getUserName = (userId: number | null) => {
    if (!userId) return "Unknown"
    const user = users.find((u) => u.id === userId)
    return user?.display_name || user?.email || "Unknown"
  }

  const getInitials = (userId: number | null) => {
    if (!userId) return "?"
    const user = users.find((u) => u.id === userId)
    if (user?.display_name) {
      return user.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }
    return user?.email[0].toUpperCase() || "?"
  }

  const filteredCampaigns = selectedUserId ? campaigns.filter((c) => c.user_id === selectedUserId) : campaigns

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            {selectedUserId ? `Campaigns by ${getUserName(selectedUserId)}` : "All Campaigns"}
          </h2>
          <p className="text-muted-foreground">
            {selectedUserId ? "Manage this user's QR campaigns" : "View and manage all QR campaigns across the platform"}
          </p>
        </div>
        {!selectedUserId && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="custom-scrollbar">
              <DialogHeader>
                <DialogTitle>Create QR Campaign</DialogTitle>
                <DialogDescription>Generate a QR code for your product recommendations</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign_name">Campaign Name</Label>
                  <Input
                    id="campaign_name"
                    placeholder="Summer Sale 2024"
                    value={formData.campaign_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, campaign_name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign_code">Campaign Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="campaign_code"
                      placeholder="SUMMER2024"
                      value={formData.campaign_code}
                      onChange={(e) => setFormData((prev) => ({ ...prev, campaign_code: e.target.value }))}
                      required
                    />
                    <Button type="button" variant="outline" onClick={generateCode}>
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Campaign description..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="Store entrance, Mall kiosk..."
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Campaign"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{selectedUserId ? "This user has no campaigns yet." : "No campaigns in the system yet."}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {!selectedUserId && <TableHead>Owner</TableHead>}
                  <TableHead>Campaign</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Scans</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    {!selectedUserId && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{getInitials(campaign.user_id)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{getUserName(campaign.user_id)}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{campaign.campaign_name}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{campaign.campaign_code}</code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{campaign.location || "-"}</TableCell>
                    <TableCell>{campaign.scan_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={campaign.is_active} onCheckedChange={() => toggleActive(campaign)} />
                        <Badge variant={campaign.is_active ? "default" : "secondary"}>
                          {campaign.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => showQRCode(campaign)} title="View QR Code">
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyLink(campaign.campaign_code)}
                          title="Copy Link"
                        >
                          {copiedCode === campaign.campaign_code ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(campaign.id)} title="Delete">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showQRDialog && selectedCampaign && (
        <QRCodeDisplay campaign={selectedCampaign} onClose={() => setShowQRDialog(false)} />
      )}
    </div>
  )
}
