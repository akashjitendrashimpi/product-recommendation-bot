"use client"

import { useEffect, useState } from "react"
import type { QRCampaign } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"
import QRCode from "qrcode"

interface QRCodeDisplayProps {
  campaign: QRCampaign
  onClose: () => void
}

export function QRCodeDisplay({ campaign, onClose }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const chatUrl = typeof window !== "undefined" ? `${window.location.origin}/chat/${campaign.campaign_code}` : ""

  useEffect(() => {
    if (chatUrl) {
      QRCode.toDataURL(chatUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      }).then(setQrDataUrl)
    }
  }, [chatUrl])

  const downloadQR = () => {
    if (!qrDataUrl) return
    const link = document.createElement("a")
    link.download = `qr-${campaign.campaign_code}.png`
    link.href = qrDataUrl
    link.click()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{campaign.campaign_name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {qrDataUrl && (
            <img
              src={qrDataUrl || "/placeholder.svg"}
              alt={`QR Code for ${campaign.campaign_name}`}
              className="rounded-lg border"
            />
          )}
          <p className="text-sm text-muted-foreground text-center break-all">{chatUrl}</p>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1 gap-2 bg-transparent" onClick={downloadQR}>
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button className="flex-1 gap-2" asChild>
              <a href={chatUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Preview
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
