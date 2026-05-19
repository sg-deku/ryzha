import { prisma } from "@/lib/prisma"
import { runR2RAgent } from "./r2r"
import { runOMAgent } from "./om"
import { runAuditorAgent } from "./auditor"
import { runFPAgent } from "./fpna"
import { runMatchingAgent } from "./p2p/matching"
import { runCollectionsAgent } from "./o2c/collections"
import { sendVoiceSummary, sendSMSNotification } from "@/lib/notifications"
import { publishEvent } from "@/lib/events"

export async function startAgentWorkflow(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!transaction) return

  const orgId = transaction.organizationId

  try {
    // Helper to log and publish
    const logAndPublish = async (agent: string, message: string) => {
      await publishEvent(`org:${orgId}:events`, {
        type: "agent_log",
        transactionId,
        agent,
        message,
        timestamp: new Date()
      })
    }

    // Step 1: R2R
    await logAndPublish("Orchestrator", "Starting R2R Agent...")
    const r2rResult = await runR2RAgent(transactionId)
    if (!r2rResult) throw new Error("R2R failed")
    await logAndPublish("R2R", "Initial revenue recorded.")

    // Step 2: O&M (only if product is annual subscription)
    await logAndPublish("Orchestrator", "Starting O&M Agent...")
    const afterOM = await runOMAgent(transactionId)
    if (!afterOM) throw new Error("O&M failed")
    await logAndPublish("O&M", "Revenue recognition policy applied.")

    // Step 3: Auditor
    await logAndPublish("Orchestrator", "Starting Auditor Agent...")
    const afterAuditor = await runAuditorAgent(transactionId)
    if (!afterAuditor || afterAuditor.auditStatus !== "verified") {
      const msg = afterAuditor?.auditStatus === "failed" ? "Verification failed" : "Audit error"
      await logAndPublish("Auditor", msg)
      // If audit fails, stop workflow but still log
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { 
          workflowStatus: "error", 
          agentLogs: { 
            push: { 
              agent: "Auditor", 
              message: msg, 
              timestamp: new Date() 
            } 
          } 
        }
      })
      return
    }
    await logAndPublish("Auditor", "Audit hash verified and sealed.")

    // Step 4: FP&A
    await logAndPublish("Orchestrator", "Starting FP&A Agent...")
    const fpResult = await runFPAgent(transactionId)
    if (!fpResult) throw new Error("FP&A failed")
    await logAndPublish("FP&A", "Financial model and runway updated.")

    // Final: Voice & SMS
    await logAndPublish("Orchestrator", "Sending notifications...")
    await sendVoiceSummary(transactionId)
    await sendSMSNotification(transactionId)

    await prisma.transaction.update({
      where: { id: transactionId },
      data: { workflowStatus: "completed" }
    })
    
    await publishEvent(`org:${orgId}:events`, {
      type: "workflow_completed",
      transactionId,
      timestamp: new Date()
    })

  } catch (error) {
    console.error("Workflow error:", error)
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { workflowStatus: "error" }
    })
    await publishEvent(`org:${orgId}:events`, {
      type: "workflow_error",
      transactionId,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date()
    })
  }
}

export async function startP2PWorkflow(vendorInvoiceId: string) {
  const invoice = await prisma.vendorInvoice.findUnique({
    where: { id: vendorInvoiceId },
    include: { organization: true }
  })
  if (!invoice) return

  try {
    const orgId = invoice.organizationId
    
    // Step 1: Matching
    const matchingResult = await runMatchingAgent(vendorInvoiceId)
    const updated = matchingResult?.updated || invoice
    const logMessage = matchingResult?.logMessage || "Matching failed"
    
    // Step 2: If matched and approved, create Expense
    if (updated.status === "MATCHED") {
      await prisma.expense.create({
        data: {
          date: new Date(),
          description: `Vendor Invoice: ${updated.invoiceNumber}`,
          amount: updated.amount,
          category: "Accounts Payable",
          organizationId: orgId,
          status: "REVIEWED"
        }
      })
    }

    await publishEvent(`org:${orgId}:events`, {
      type: "p2p_workflow_log",
      vendorInvoiceId,
      message: logMessage,
      timestamp: new Date()
    })
  } catch (error) {
    console.error("P2P Workflow error:", error)
  }
}

export async function startO2CWorkflow(salesOrderId: string) {
  const order = await prisma.salesOrder.findUnique({
    where: { id: salesOrderId },
    include: { organization: true, customer: true }
  })
  if (!order) return

  try {
    const orgId = order.organizationId

    // Step 1: Logic for O2C (e.g. invoicing, collections check)
    if (order.status === "PAID") {
      // Create a transaction to trigger the main agent workflow
      const transaction = await prisma.transaction.create({
        data: {
          stripePaymentIntentId: `o2c-${order.orderNumber}-${Date.now()}`,
          amount: order.totalAmount,
          description: `Sales Order Payment: ${order.orderNumber} - ${order.customer.name}`,
          customerEmail: order.customer.email,
          organizationId: orgId,
          agentLogs: []
        }
      })

      // Start the main financial brain agents (R2R, O&M, Auditor, FP&A)
      await startAgentWorkflow(transaction.id)
    }

    await publishEvent(`org:${orgId}:events`, {
      type: "o2c_workflow_log",
      salesOrderId,
      message: `O2C: Processed order ${order.orderNumber}. Status: ${order.status}`,
      timestamp: new Date()
    })
  } catch (error) {
    console.error("O2C Workflow error:", error)
  }
}
