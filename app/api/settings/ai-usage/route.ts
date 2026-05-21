export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfMonth, startOfDay, subMonths } from "date-fns"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const orgId = session.user.organizationId
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 })

  const now = new Date()
  const monthStart = startOfMonth(now)
  const todayStart = startOfDay(now)
  const last6MonthsStart = startOfMonth(subMonths(now, 5))

  const [allTime, thisMonth, today, byFeature, byMonth] = await Promise.all([
    prisma.aIUsageLog.aggregate({
      where: { organizationId: orgId },
      _sum: { totalTokens: true, promptTokens: true, completionTokens: true },
      _count: { id: true },
    }),
    prisma.aIUsageLog.aggregate({
      where: { organizationId: orgId, createdAt: { gte: monthStart } },
      _sum: { totalTokens: true },
      _count: { id: true },
    }),
    prisma.aIUsageLog.aggregate({
      where: { organizationId: orgId, createdAt: { gte: todayStart } },
      _sum: { totalTokens: true },
      _count: { id: true },
    }),
    prisma.aIUsageLog.groupBy({
      by: ["feature"],
      where: { organizationId: orgId, createdAt: { gte: monthStart } },
      _sum: { totalTokens: true },
      _count: { id: true },
      orderBy: { _sum: { totalTokens: "desc" } },
    }),
    prisma.aIUsageLog.findMany({
      where: { organizationId: orgId, createdAt: { gte: last6MonthsStart } },
      select: { createdAt: true, totalTokens: true },
      orderBy: { createdAt: "asc" },
    }),
  ])

  const monthlyMap: Record<string, number> = {}
  for (const row of byMonth) {
    const key = `${row.createdAt.getFullYear()}-${String(row.createdAt.getMonth() + 1).padStart(2, "0")}`
    monthlyMap[key] = (monthlyMap[key] ?? 0) + row.totalTokens
  }
  const monthlyTrend = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, tokens]) => ({ month, tokens }))

  return NextResponse.json({
    allTime: {
      totalTokens: allTime._sum.totalTokens ?? 0,
      promptTokens: allTime._sum.promptTokens ?? 0,
      completionTokens: allTime._sum.completionTokens ?? 0,
      calls: allTime._count.id,
    },
    thisMonth: {
      totalTokens: thisMonth._sum.totalTokens ?? 0,
      calls: thisMonth._count.id,
    },
    today: {
      totalTokens: today._sum.totalTokens ?? 0,
      calls: today._count.id,
    },
    byFeature: byFeature.map((f) => ({
      feature: f.feature,
      totalTokens: f._sum.totalTokens ?? 0,
      calls: f._count.id,
    })),
    monthlyTrend,
  })
}
