import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startAgentWorkflow, startP2PWorkflow, startO2CWorkflow } from "@/lib/agents/orchestrator"

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { type, payload } = await req.json()
    const orgId = session.user.organizationId
    let executionId = ""

    if (type === "stripe") {
      const transaction = await prisma.transaction.create({
        data: {
          stripePaymentIntentId: `sim_tx_${Date.now()}`,
          amount: Number(payload?.amount) || 1000,
          description: payload?.description || "Manual Stripe Simulation",
          customerEmail: "simulated@example.com",
          organizationId: orgId,
          agentLogs: []
        }
      })
      executionId = transaction.id
      startAgentWorkflow(executionId).catch(console.error)

    } else if (type === "p2p") {
      // Mock vendor and PO first
      const vendor = await prisma.vendor.create({
        data: { name: `Mock Vendor ${Date.now()}`, email: "mock@vendor.com", organizationId: orgId }
      })
      const po = await prisma.purchaseOrder.create({
        data: { poNumber: `PO-${Date.now()}`, vendorId: vendor.id, totalAmount: 500, organizationId: orgId }
      })
      const invoice = await prisma.vendorInvoice.create({
        data: {
          invoiceNumber: `INV-${Date.now()}`,
          vendorId: vendor.id,
          purchaseOrderId: po.id,
          amount: 500,
          dueDate: new Date(),
          organizationId: orgId
        }
      })
      executionId = invoice.id
      startP2PWorkflow(executionId).catch(console.error)

    } else if (type === "o2c") {
      // Mock customer and Sales Order
      const customer = await prisma.customer.create({
        data: { name: `Mock Customer ${Date.now()}`, email: "mock@customer.com", organizationId: orgId }
      })
      const so = await prisma.salesOrder.create({
        data: {
          orderNumber: `SO-${Date.now()}`,
          customerId: customer.id,
          totalAmount: 1500,
          organizationId: orgId,
          status: "PAID" // to trigger workflow in orchestrator
        }
      })
      executionId = so.id
      startO2CWorkflow(executionId).catch(console.error)
    }

    return NextResponse.json({ executionId })
  } catch (error: any) {
    console.error("Workflow trigger error:", error)
    return NextResponse.json({ error: error.message || "Failed to trigger workflow" }, { status: 500 })
  }
}
