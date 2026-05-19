import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { triggerWebhook } from "@/lib/webhook-delivery"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { status } = await req.json()
    
    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, organizationId: session.user.organizationId }
    })

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 })

    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: { status },
      include: { lineItems: true }
    })

    if (status === "PAID") {
      await triggerWebhook("invoice.paid", session.user.organizationId, {
        invoiceId: updated.id,
        invoiceNumber: updated.invoiceNumber,
        amount: updated.total,
        clientName: updated.clientName,
        paidAt: new Date().toISOString()
      })
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
