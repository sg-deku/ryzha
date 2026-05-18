import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CashFlowForecast } from "./cashflow-chart"

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
          <p className="text-gray-500">Welcome back, {session.user?.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Current Cash Position</p>
          <p className="text-2xl font-bold text-green-600">$15,000.00</p>
        </div>
      </div>

      <CashFlowForecast />
    </div>
  )
}
