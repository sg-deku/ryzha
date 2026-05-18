"use client"

import { useEffect, useState } from "react"
import { KPICard } from "./kpi-card"

interface KPI {
  title: string
  value: string
  change: string
  data: number[]
}

export function KPIGrid() {
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats")
        if (res.ok) {
          const data = await res.json()
          setKpis(data)
        }
      } catch (error) {
        console.error("Failed to fetch KPIs", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, i) => (
        <KPICard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          change={kpi.change}
          data={kpi.data}
          index={i}
        />
      ))}
    </div>
  )
}