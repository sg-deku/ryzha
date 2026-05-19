import { prisma } from "@/lib/prisma"

export async function runOMAgent(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!transaction) return null

  const isAnnualSubscription = transaction.description?.toLowerCase().includes("annual") ||
                               transaction.description?.toLowerCase().includes("yearly")

  let updated
  if (isAnnualSubscription) {
    const monthlyPortion = transaction.amount / 12
    const deferred = transaction.amount - monthlyPortion
    updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        recognizedRevenue: monthlyPortion,
        deferredRevenue: deferred,
        revenueRecognitionType: "deferred",
        agentLogs: {
          push: {
            agent: "O&M",
            message: `STOP! According to ASC 606, annual subscriptions are deferred. Corrected: recognized $${monthlyPortion.toFixed(2)}, deferred $${deferred.toFixed(2)}.`,
            timestamp: new Date()
          }
        }
      }
    })
  } else {
    // O&M approves as is
    updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        agentLogs: {
          push: { agent: "O&M", message: "Approved: immediate revenue recognition.", timestamp: new Date() }
        }
      }
    })
  }
  return updated
}
