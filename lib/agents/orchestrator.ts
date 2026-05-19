import { prisma } from "@/lib/prisma"
import { runR2RAgent } from "./r2r"
import { runOMAgent } from "./om"
import { runAuditorAgent } from "./auditor"
import { runFPAgent } from "./fpna"
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
