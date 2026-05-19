import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  let settings = await prisma.financialSettings.findUnique({ 
    where: { organizationId: session.user.organizationId } 
  })
  
  if (!settings) {
    settings = await prisma.financialSettings.create({ 
      data: { 
        organizationId: session.user.organizationId,
        deferredRevenueRules: ["annual", "yearly", "subscription"]
      } 
    })
  }
  
  return NextResponse.json(settings)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const body = await req.json()
  
  // Remove id and organizationId from body to prevent accidental updates
  const { id, organizationId, ...updateData } = body
  
  const updated = await prisma.financialSettings.upsert({
    where: { organizationId: session.user.organizationId },
    update: updateData,
    create: { ...updateData, organizationId: session.user.organizationId }
  })
  
  return NextResponse.json(updated)
}
