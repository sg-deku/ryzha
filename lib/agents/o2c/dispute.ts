import { getLLM } from "@/lib/ai/llm"

export async function runDisputeAgent(invoiceId: string, reason: string, organizationId: string) {
  const model = await getLLM(organizationId, { modelName: "gpt-4o-mini", temperature: 0 })

  const systemPrompt = "Classify the dispute reason and suggest a resolution strategy."
  
  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Invoice ID: ${invoiceId}, Reason: ${reason}` }
  ])

  return {
    agent: "Dispute Resolution Agent",
    classification: "Billing Error",
    suggestedAction: "Issue credit memo",
    aiReasoning: response.content
  }
}
