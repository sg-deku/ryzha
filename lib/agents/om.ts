import { prisma } from "@/lib/prisma"
import { getFinancialContext } from "@/lib/ai/rag"
import { ChatOpenAI } from "@langchain/openai"

export async function runOMAgent(transactionId: string) {
  const tx = await prisma.transaction.findUnique({ 
    where: { id: transactionId },
    include: { 
      organization: { 
        include: { financialSettings: true } 
      } 
    } 
  })
  
  if (!tx) return null

  const settings = tx.organization.financialSettings
  const deferralMonths = settings?.deferralPeriodMonths || 12
  const deferredRules = (settings?.deferredRevenueRules as string[]) || ["annual", "yearly", "subscription"]

  let isDeferred = deferredRules.some(rule => tx.description?.toLowerCase().includes(rule.toLowerCase()))
  let aiReasoning = ""

  // Upgrade with RAG and AI
  if (tx.description && process.env.OPENAI_API_KEY) {
    try {
      const context = await getFinancialContext(`How should we recognize revenue for: ${tx.description}?`, tx.organizationId)
      
      const model = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature: 0,
      })

      const response = await model.invoke([
        {
          role: "system",
          content: `You are an expert accountant (O&M Agent). Decide if revenue should be recognized immediately or deferred based on ASC 606 rules. 
          Context: ${context}
          Respond with JSON: { "deferred": boolean, "reason": string, "period": number }`
        },
        {
          role: "user",
          content: `Transaction: ${tx.description}, Amount: ${tx.amount}`
        }
      ])

      try {
        const result = JSON.parse(response.content as string)
        isDeferred = result.deferred
        aiReasoning = result.reason
      } catch (e) {
        console.error("AI reasoning failed", e)
      }
    } catch (error) {
      console.error("O&M AI failed", error)
    }
  }

  let updated
  if (isDeferred) {
    const monthlyPortion = tx.amount / deferralMonths
    const deferred = tx.amount - monthlyPortion
    const logMessage = aiReasoning 
      ? `O&M: ${aiReasoning} (ASC 606). Recognized $${monthlyPortion.toFixed(2)}, deferred $${deferred.toFixed(2)} over ${deferralMonths} months.`
      : `STOP! According to ASC 606, this transaction should be deferred. Recognized $${monthlyPortion.toFixed(2)}, deferred $${deferred.toFixed(2)}.`

    updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        recognizedRevenue: monthlyPortion,
        deferredRevenue: deferred,
        revenueRecognitionType: "deferred",
        agentLogs: {
          push: {
            agent: "O&M",
            message: logMessage,
            timestamp: new Date().toISOString()
          }
        }
      }
    })
  } else {
    updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        agentLogs: {
          push: { 
            agent: "O&M", 
            message: aiReasoning || "Approved: immediate revenue recognition.", 
            timestamp: new Date().toISOString() 
          }
        }
      }
    })
  }
  return updated
}
