"use client"

import type React from "react"
import { useState } from "react"
import type { QRCampaign } from "@/lib/types"
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
import { Plus, Trash2, QrCode, Eye, Copy, Check } from "lucide-react"
import { QRCodeDisplay } from "./qr-code-display"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

interface CampaignsTabProps {
  campaigns: QRCampaign[]
  setCampaigns: React.Dispatch<React.SetStateAction<QRCampaign[]>>
  userId: number
}

export function CampaignsTab({ campaigns, setCampaigns, userId }: CampaignsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<QRCampaign | null>(null)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Your QR Campaigns</h2>
          <p className="text-muted-foreground">Create QR codes for product recommendations</p>
        </div>
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
          <DialogContent>
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
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="Store entrance, Mall kiosk..."
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                />
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
      </div>

      {selectedCampaign && <QRCodeDisplay campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />}

      <Card>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No campaigns yet. Create your first QR campaign to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Scans</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.campaign_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">{campaign.campaign_code}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyLink(campaign.campaign_code)}
                        >
                          {copiedCode === campaign.campaign_code ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
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
                        <Button variant="ghost" size="icon" onClick={() => setSelectedCampaign(campaign)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(campaign.id)}>
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
    </div>
  )
}
