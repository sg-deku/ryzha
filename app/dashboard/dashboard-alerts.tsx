"use client"

import { useState, useEffect } from "react"
import { AnomalyCard } from "@/components/alerts/anomaly-card"

export function DashboardAlerts() {
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAnomalies = async () => {
    try {
      const res = await fetch("/api/expenses/alert")
      if (res.ok) setAnomalies(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnomalies()
  }, [])

  const handleBulkResolve = async () => {
    try {
      await fetch("/api/expenses/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve_all" })
      })
      setAnomalies([])
    } catch (err) {
      console.error(err)
    }
  }

  if (loading || anomalies.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🔔</span> Expense Anomalies
        </h2>
        <button 
          onClick={handleBulkResolve}
          className="text-xs text-blue-600 hover:underline"
        >
          Mark all as reviewed
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {anomalies.map(a => (
          <AnomalyCard key={a.id} anomaly={a} onResolve={fetchAnomalies} />
        ))}
      </div>
    </div>
  )
}
