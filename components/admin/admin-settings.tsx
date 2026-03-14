"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Settings, IndianRupee, CheckCircle2 } from "lucide-react"

interface Setting {
  key: string
  value: string
  description: string
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      setSettings(data.settings || [])
      const v: Record<string, string> = {}
      ;(data.settings || []).forEach((s: Setting) => { v[s.key] = s.value })
      setValues(v)
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSetting = async (key: string) => {
    setSaving(key)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: values[key] }),
      })
      if (res.ok) {
        setSaved(key)
        setTimeout(() => setSaved(null), 2000)
      } else {
        alert("Failed to save setting")
      }
    } catch {
      alert("Failed to save setting")
    } finally {
      setSaving(null)
    }
  }

  const settingConfig: Record<string, { label: string; description: string; prefix: string; min: number }> = {
    min_payout: {
      label: "Minimum Withdrawal",
      description: "Minimum amount a user must have to request a payout",
      prefix: "₹",
      min: 1,
    },
    max_payout: {
      label: "Maximum Per Request",
      description: "Maximum amount a user can withdraw in a single request",
      prefix: "₹",
      min: 1,
    },
    max_daily_payout: {
      label: "Daily Payout Limit",
      description: "Maximum total withdrawal amount per user per day",
      prefix: "₹",
      min: 1,
    },
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure platform-wide payout rules</p>
      </div>

      {/* Payout Settings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <IndianRupee className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-gray-800">Payout Limits</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(settingConfig).map(([key, config]) => (
            <Card key={key} className="border border-gray-200 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{config.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="relative w-40">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">{config.prefix}</span>
                        <Input
                          type="number"
                          min={config.min}
                          value={values[key] || ""}
                          onChange={e => setValues({ ...values, [key]: e.target.value })}
                          className="pl-7 rounded-xl h-10 font-bold"
                        />
                      </div>
                      <Button
                        onClick={() => saveSetting(key)}
                        disabled={saving === key}
                        size="sm"
                        className={`rounded-xl h-10 px-4 transition-all ${saved === key ? 'bg-green-600 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {saved === key ? (
                          <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Saved!</>
                        ) : saving === key ? (
                          "Saving..."
                        ) : (
                          <><Save className="w-4 h-4 mr-1.5" /> Save</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Changes apply instantly</p>
            <p className="text-xs text-blue-600 mt-0.5">New payout requests will use the updated limits immediately. Existing pending requests are not affected.</p>
          </div>
        </div>
      </div>
    </div>
  )
}