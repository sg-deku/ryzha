"use client"

import dynamic from "next/dynamic"
import { KPIGrid } from "@/components/dashboard/kpi-grid"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { TransactionFeed } from "@/components/dashboard/transaction-feed"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { DashboardAlerts } from "./dashboard-alerts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"

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
  pendingPurchases?: number
  overdueSales?: number
}

export function DashboardClient({ userName, orgId, pendingPurchases = 0, overdueSales = 0 }: DashboardClientProps) {
  return (
    <div className="space-y-8">
      {/* KPI row – white cards on light gray */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIGrid />
      </div>

      {(pendingPurchases > 0 || overdueSales > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {pendingPurchases > 0 && (
            <Card className="border-orange-200 bg-orange-50/30 dark:bg-orange-900/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending P2P Approvals</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingPurchases}</div>
                <p className="text-xs text-muted-foreground">Purchase orders waiting for your review.</p>
                <Button variant="link" className="px-0 h-auto mt-2 text-orange-600" asChild>
                  <Link href="/purchases?status=PENDING_APPROVAL" className="flex items-center">
                    Review Now <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {overdueSales > 0 && (
            <Card className="border-red-200 bg-red-50/30 dark:bg-red-900/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue O2C Invoices</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overdueSales}</div>
                <p className="text-xs text-muted-foreground">Invoices past their due date.</p>
                <Button variant="link" className="px-0 h-auto mt-2 text-red-600" asChild>
                  <Link href="/collections" className="flex items-center">
                    Collect Payments <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

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
