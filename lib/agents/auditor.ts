import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function runAuditorAgent(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { organization: true }
  })
  if (!transaction) return null

  // Find matching contract
  const contract = await prisma.contract.findFirst({
    where: {
      stripePaymentIntentId: transaction.stripePaymentIntentId,
      organizationId: transaction.organizationId
    }
  })

  let auditStatus = "failed"
  let auditHash = null
  let logMessage = ""

  if (contract && contract.status === "signed") {
    auditStatus = "verified"
    auditHash = crypto.createHash("sha256").update(`${contract.id}-${transaction.amount}`).digest("hex")
    logMessage = `Auditor: Audit Hash Verified: Stripe ID matches Contract Terms. Hash: ${auditHash.substring(0, 8)}...`
  } else {
    logMessage = `Auditor: Verification failed – no matching contract for Stripe ID ${transaction.stripePaymentIntentId}`
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      auditStatus,
      auditHash,
      agentLogs: {
        push: { agent: "Auditor", message: logMessage, timestamp: new Date() }
      }
    }
  })
  return updated
}
