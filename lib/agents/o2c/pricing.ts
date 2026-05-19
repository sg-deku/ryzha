import { getLLM } from "@/lib/ai/llm"

export async function runPricingAgent(orderData: any, organizationId: string) {
  const model = await getLLM(organizationId, { modelName: "gpt-4o-mini", temperature: 0 })

  const systemPrompt = "Suggest optimal pricing and potential discounts for this order based on customer history and current promotions."
  
  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Order Data: ${JSON.stringify(orderData)}` }
  ])

  return {
    agent: "Pricing & Discount Agent",
    suggestedDiscount: "5%",
    finalPrice: (orderData.amount || 1000) * 0.95,
    aiReasoning: response.content
  }
}
