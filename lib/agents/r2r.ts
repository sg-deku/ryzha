import { prisma } from "@/lib/prisma"

export async function runR2RAgent(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } })
  if (!transaction) return null

  // R2R tries to record all as immediate revenue
  const recognizedRevenue = transaction.amount
  const logMessage = `R2R: New payment of $${transaction.amount}. Recording credit to revenue.`

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      recognizedRevenue,
      revenueRecognitionType: "immediate",
      agentLogs: {
        push: { agent: "R2R", message: logMessage, timestamp: new Date() }
      }
    }
  })
  return updated
}
