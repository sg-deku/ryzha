import OpenAI from "openai"

let openaiInstance: OpenAI | null = null

function getOpenAI() {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY environment variable")
    }
    openaiInstance = new OpenAI({ apiKey })
  }
  return openaiInstance
}

const categories = [
  "Software & SaaS",
  "Hardware",
  "Office Supplies",
  "Meals & Entertainment",
  "Travel",
  "Marketing",
  "Legal",
  "Contractors",
  "Rent",
  "Utilities",
  "Other"
]

export async function categorizeExpense(description: string, amount: number, vendor?: string) {
  let retries = 2
  let lastError: any

  while (retries >= 0) {
    try {
      const prompt = `You are an expense categorizer for startup accounting.
Transaction: Description: "${description}", Amount: ${amount}, Vendor: ${vendor || "unknown"}.
Choose best category from: ${categories.join(", ")}. Also decide tax-deductible (true/false).
Return JSON: { "category": string, "taxRelevant": boolean, "confidence": 0-1 }`

      const openai = getOpenAI()
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })

      const result = JSON.parse(completion.choices[0].message.content || "{}")
      return { 
        category: result.category || "Other",
        taxRelevant: result.taxRelevant ?? false,
        confidence: result.confidence ?? 0.5 
      }
    } catch (error) {
      lastError = error
      retries--
      if (retries >= 0) {
        console.warn(`AI categorization failed, retrying... (${retries} left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  console.error("AI categorization failed after retries:", lastError)
  throw lastError
}
