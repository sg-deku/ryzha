import { getLLM } from "@/lib/ai/llm"

export async function runGLCodingAgent(description: string, organizationId: string) {
  const model = await getLLM(organizationId, { modelName: "gpt-4o-mini", temperature: 0 })

  const systemPrompt = `
    You are an AI GL Coding Agent.
    Based on the description of an expense or invoice, suggest the most appropriate General Ledger (GL) account or category.
  `

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Description: ${description}` }
  ])

  return {
    agent: "GL Coding Agent",
    suggestedCategory: "Professional Services",
    aiReasoning: response.content
  }
}
