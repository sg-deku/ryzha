"use client"

import dynamic from "next/dynamic"
import { KPIGrid } from "@/components/dashboard/kpi-grid"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { TransactionFeed } from "@/components/dashboard/transaction-feed"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { DashboardAlerts } from "./dashboard-alerts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SkeletonCard } from "@/components/ui/skeleton-card"

const CashFlowForecast = dynamic(() => import("./cashflow-chart").then(mod => mod.CashFlowForecast), {
  ssr: false,
  loading: () => <SkeletonCard />
})

const AnomalyCarousel = dynamic(() => import("@/components/dashboard/anomaly-carousel").then(mod => mod.AnomalyCarousel), {
  ssr: false,
  loading: () => <div className="h-[100px] w-full bg-muted animate-pulse rounded-xl" />
})

interface DashboardClientProps {
  userName: string | null | undefined
  orgId: string | undefined
}

export function DashboardClient({ userName, orgId }: DashboardClientProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back, {userName}.</p>
        </div>
      </div>

      {/* KPI row – white cards on light gray */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIGrid />
      </div>

      <div className="my-6 border-t" />

      {/* Anomalies section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Alerts</h2>
        <AnomalyCarousel />
      </div>

      <div className="my-6 border-t" />

      {/* Main breakdown – elevated cards for primary data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Cash Flow Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <CashFlowForecast />
            </CardContent>
          </Card>
          
          <Card className="card-default">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionFeed orgId={orgId} />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-8">
          <DashboardAlerts />
          
          <Card className="card-default">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Top Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList orgId={orgId} />
            </CardContent>
          </Card>
          
          <Card className="card-default">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
