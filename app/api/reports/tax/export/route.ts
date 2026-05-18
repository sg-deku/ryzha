import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { buildTaxReport } from "@/lib/tax/tax-report-builder"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return new Response("Unauthorized", { status: 401 })

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  if (!startDate || !endDate) {
    return new Response("Missing date range", { status: 400 })
  }

  try {
    const report = await buildTaxReport(
      session.user.organizationId,
      new Date(startDate),
      new Date(endDate)
    )

    // Generate CSV
    const headers = ["Date", "Reference", "Type", "Amount", "Tax"]
    const rows = report.details.map(d => [
      new Date(d.date).toLocaleDateString(),
      d.reference,
      d.type,
      d.amount.toFixed(2),
      d.tax.toFixed(2)
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tax-report-${startDate}-to-${endDate}.csv"`
      }
    })
  } catch (error: any) {
    console.error("CSV export error:", error)
    return new Response("Failed to export CSV", { status: 500 })
  }
}
