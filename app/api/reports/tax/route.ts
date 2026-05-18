import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { buildTaxReport } from "@/lib/tax/tax-report-builder"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "Missing date range" }, { status: 400 })
  }

  try {
    const report = await buildTaxReport(
      session.user.organizationId,
      new Date(startDate),
      new Date(endDate)
    )
    return NextResponse.json(report)
  } catch (error: any) {
    console.error("Report generation error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
