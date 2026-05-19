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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Real‑time financial brain. Welcome back, {userName}.</p>
      </div>

      <AnomalyCarousel />
      
      <KPIGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <CashFlowForecast />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionFeed orgId={orgId} />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <DashboardAlerts />
          
          <Card>
            <CardHeader>
              <CardTitle>Top Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList orgId={orgId} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
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
