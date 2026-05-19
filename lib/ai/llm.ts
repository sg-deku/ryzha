import { prisma } from "@/lib/prisma"
import { ChatOpenAI } from "@langchain/openai"
import { ChatAnthropic } from "@langchain/anthropic"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

export async function getLLM(organizationId: string, options: any = {}) {
  const settings = await prisma.financialSettings.findUnique({
    where: { organizationId },
  })

  const provider = settings?.aiProvider || "openai"
  const model = settings?.aiModel || "gpt-4o-mini"
  const apiKey = settings?.aiApiKey || undefined // Use default env var if undefined

  switch (provider) {
    case "anthropic":
      return new ChatAnthropic({
        modelName: model,
        temperature: options.temperature ?? 0.2,
        anthropicApiKey: apiKey,
        ...options,
      })
    case "gemini":
      return new ChatGoogleGenerativeAI({
        modelName: model,
        temperature: options.temperature ?? 0.2,
        apiKey: apiKey,
        ...options,
      })
    case "openai":
    default:
      return new ChatOpenAI({
        modelName: model,
        temperature: options.temperature ?? 0.2,
        openAIApiKey: apiKey,
        ...options,
      })
  }
}
