import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CashFlowForecast } from "./cashflow-chart"
import { DashboardAlerts } from "./dashboard-alerts"
import { ThemeToggle } from "@/components/theme-toggle"
import { KPIGrid } from "@/components/dashboard/kpi-grid"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { AnomalyCarousel } from "@/components/dashboard/anomaly-carousel"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { onboardingCompleted: true }
  })

  if (!org?.onboardingCompleted) redirect("/onboarding")

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user?.name}</p>
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
