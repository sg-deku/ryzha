import { getLLM } from "@/lib/ai/llm"

export async function runCustomerValidationAgent(customerData: any, organizationId: string) {
  const model = await getLLM(organizationId, { modelName: "gpt-4o-mini", temperature: 0 })

  const systemPrompt = "Validate the customer data for completeness and potential fraud risk."
  
  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Customer Data: ${JSON.stringify(customerData)}` }
  ])

  return {
    agent: "Customer Validation Agent",
    status: "VALIDATED",
    riskScore: "Low",
    aiReasoning: response.content
  }
}
