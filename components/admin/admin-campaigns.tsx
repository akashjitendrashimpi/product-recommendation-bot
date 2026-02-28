"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Trash2, X, QrCode, Download, Eye, Copy } from "lucide-react"

interface Campaign {
  id: number
  campaign_name: string
  campaign_code: string
  description: string | null
  location: string | null
  is_active: boolean
  scan_count: number
  created_at: string
}

export function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedQR, setSelectedQR] = useState<Campaign | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    campaign_name: '',
    campaign_code: '',
    description: '',
    location: '',
  })
  const qrRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => { fetchCampaigns() }, [])

  useEffect(() => {
    if (selectedQR) generateQR(selectedQR.campaign_code)
  }, [selectedQR])

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns?all=true')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQR = async (code: string) => {
    try {
      const QRCode = (await import('qrcode')).default
      const url = `${window.location.origin}/chat/${code}`
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      })
      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error('Error generating QR:', error)
    }
  }

  const createCampaign = async () => {
    if (!form.campaign_name || !form.campaign_code) {
      alert('Please fill in campaign name and code')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ campaign_name: '', campaign_code: '', description: '', location: '' })
        fetchCampaigns()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteCampaign = async (id: number) => {
    if (!confirm('Delete this campaign?')) return
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      if (res.ok) fetchCampaigns()
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }

  const downloadQR = () => {
    if (!qrDataUrl || !selectedQR) return
    const link = document.createElement('a')
    link.download = `qr-${selectedQR.campaign_code}.png`
    link.href = qrDataUrl
    link.click()
  }

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/chat/${code}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateCode = () => {
    const code = form.campaign_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 20) + '-' + Math.random().toString(36).slice(2, 6)
    setForm({ ...form, campaign_code: code })
  }

  const filtered = campaigns.filter(c =>
    c.campaign_name.toLowerCase().includes(search.toLowerCase()) ||
    c.campaign_code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Campaigns</h1>
          <p className="text-gray-600 mt-1">{campaigns.length} total campaigns</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </div>

      {/* Add Campaign Form */}
      {showForm && (
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Campaign</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Campaign Name *</Label>
                <Input
                  value={form.campaign_name}
                  onChange={e => setForm({ ...form, campaign_name: e.target.value })}
                  placeholder="e.g. Shop ABC - Counter 1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Campaign Code *</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={form.campaign_code}
                    onChange={e => setForm({ ...form, campaign_code: e.target.value })}
                    placeholder="e.g. shop-abc-1"
                  />
                  <Button variant="outline" onClick={generateCode} type="button">
                    Auto
                  </Button>
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-xs text-gray-500">QR will link to:</p>
              <p className="text-sm font-mono text-blue-600">
                {typeof window !== 'undefined' ? window.location.origin : ''}/chat/{form.campaign_code || 'your-code'}
              </p>
            </div>
            <Button
              onClick={createCampaign}
              disabled={submitting}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? 'Creating...' : 'Create Campaign & Generate QR'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* QR Preview Modal */}
      {selectedQR && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">QR Code — {selectedQR.campaign_name}</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedQR(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {qrDataUrl && (
                <div className="flex-shrink-0">
                  <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 border border-gray-200 rounded-lg" />
                </div>
              )}
              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Campaign Link:</p>
                  <p className="text-sm font-mono bg-white border border-gray-200 rounded px-3 py-2 break-all">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/chat/{selectedQR.campaign_code}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={downloadQR} className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" /> Download QR
                  </Button>
                  <Button variant="outline" onClick={() => copyLink(selectedQR.campaign_code)}>
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`/chat/${selectedQR.campaign_code}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4 mr-2" /> Preview
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Total scans: <span className="font-semibold text-gray-900">{selectedQR.scan_count}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search campaigns..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Campaigns Table */}
      <Card className="border border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No campaigns yet. Create one above!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Campaign</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Scans</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{campaign.campaign_name}</p>
                        <p className="text-xs text-gray-500">{new Date(campaign.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{campaign.campaign_code}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{campaign.location || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-blue-600">{campaign.scan_count}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={campaign.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                          {campaign.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedQR(campaign)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <QrCode className="w-3 h-3 mr-1" /> QR
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCampaign(campaign.id)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}