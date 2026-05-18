"use client"

import dynamic from "next/dynamic"
import { KPIGrid } from "@/components/dashboard/kpi-grid"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { DashboardAlerts } from "./dashboard-alerts"
import { ThemeToggle } from "@/components/theme-toggle"

const CashFlowForecast = dynamic(() => import("./cashflow-chart").then(mod => mod.CashFlowForecast), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl" />
})

const AnomalyCarousel = dynamic(() => import("@/components/dashboard/anomaly-carousel").then(mod => mod.AnomalyCarousel), {
  ssr: false,
  loading: () => <div className="h-[100px] w-full bg-muted animate-pulse rounded-xl" />
})

interface DashboardClientProps {
  userName: string | null | undefined
}

export function DashboardClient({ userName }: DashboardClientProps) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Cash Position</p>
            <p className="text-2xl font-bold text-green-600">$15,000.00</p>
          </div>
        </div>
      </div>

      <AnomalyCarousel />

      <KPIGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CashFlowForecast />
        </div>
        <div className="space-y-6">
          <DashboardAlerts />
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
