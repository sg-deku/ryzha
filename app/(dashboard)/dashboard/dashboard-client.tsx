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
    <div className="space-y-8">
      {/* KPI row – white cards on light gray */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIGrid />
      </div>

      {/* Simulator + Agent Log – side by side on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Cash Flow Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowForecast />
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Agent Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed />
          </CardContent>
        </Card>
      </div>

      {/* Audit + Runway – bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-default">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Audit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardAlerts />
          </CardContent>
        </Card>
        <Card className="card-default">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Runway Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList orgId={orgId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
