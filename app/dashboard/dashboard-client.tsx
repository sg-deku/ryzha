"use client"

import dynamic from "next/dynamic"
import { KPIGrid } from "@/components/dashboard/kpi-grid"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { DashboardAlerts } from "./dashboard-alerts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
            <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Cash Position</p>
              <p className="text-xl font-bold text-green-600">$15,000.00</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
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
        </CardContent>
      </Card>
    </div>
  )
}
