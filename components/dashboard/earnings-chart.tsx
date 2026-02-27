"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface EarningsChartProps {
  data?: number[]
}

function Sparkline({ data }: { data: number[] }) {
  const width = 300
  const height = 80
  const padding = 6
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const points = data
    .map((v, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * (width - padding * 2) + padding
      const y = height - ((v - min) / (max - min || 1)) * (height - padding * 2) - padding
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline fill="none" stroke="#0ea5e9" strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * (width - padding * 2) + padding
        const y = height - ((v - min) / (max - min || 1)) * (height - padding * 2) - padding
        return <circle key={i} cx={x} cy={y} r={2.5} fill="#0369a1" />
      })}
    </svg>
  )
}

export default function EarningsChart({ data }: EarningsChartProps) {
  const sample = data ?? [20, 24, 18, 28, 34, 30, 38]

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Earnings Trend</CardTitle>
        <CardDescription className="text-sm">Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Sparkline data={sample} />
          </div>
          <div className="w-32 text-right">
            <div className="text-sm text-gray-500">This week</div>
            <div className="text-2xl font-bold text-green-600">₹{sample.reduce((a, b) => a + b, 0)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
