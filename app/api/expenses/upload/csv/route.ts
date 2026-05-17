import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseExpenseCSV } from "@/lib/parsers/csv-parser"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const mapping = formData.get("mapping") as string
    
    if (!file || !mapping) {
      return NextResponse.json({ error: "Missing file or mapping" }, { status: 400 })
    }

    const columnMapping = JSON.parse(mapping)
    const text = await file.text()
    const parsed = parseExpenseCSV(text, columnMapping)

    const expenses = await prisma.expense.createMany({
      data: parsed.map((row: any) => ({
        date: new Date(row.date),
        description: row.description,
        amount: parseFloat(row.amount),
        status: "PENDING",
        organizationId: session.user.organizationId
      }))
    })

    return NextResponse.json({ count: expenses.count })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
