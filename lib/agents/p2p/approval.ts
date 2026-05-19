import { prisma } from "@/lib/prisma"
import { getLLM } from "@/lib/ai/llm"

export async function runApprovalAgent(poId: string, organizationId: string) {
  const model = await getLLM(organizationId, { modelName: "gpt-4o-mini", temperature: 0 })

  // In a real app, we'd fetch the PO and check against approval rules
  // const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } })

  const systemPrompt = `
    You are an AI Approval Routing Agent.
    You analyze purchase orders and decide who needs to approve them based on amount, category, and historical data.
    For now, suggest an approval path.
  `

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: `PO ID: ${poId}` }
  ])

  return {
    agent: "Approval Agent",
    status: "ROUTED",
    suggestedApprovers: ["Department Head", "Finance Manager"],
    aiReasoning: response.content
  }
}
