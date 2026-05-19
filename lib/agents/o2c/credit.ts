import { ChatOpenAI } from "@langchain/openai"

export async function runCreditAgent(customerId: string, amount: number, organizationId: string) {
  const model = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 })

  const systemPrompt = "Evaluate the customer's credit worthiness for a specific order amount."
  
  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Customer ID: ${customerId}, Order Amount: ${amount}` }
  ])

  return {
    agent: "Credit Agent",
    approved: true,
    creditLimit: 10000,
    aiReasoning: response.content
  }
}
