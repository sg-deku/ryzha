import { prisma } from "@/lib/prisma"
import { BaseMessage } from "@langchain/core/messages"
import { ChatOpenAI } from "@langchain/openai"
import { ChatAnthropic } from "@langchain/anthropic"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatOllama } from "@langchain/ollama"

function detectAvailableProvider(): string {
  if (process.env.OPENAI_API_KEY) return "openai"
  if (process.env.GROQ_API_KEY) return "groq"
  if (process.env.ANTHROPIC_API_KEY) return "anthropic"
  if (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) return "gemini"
  return "openai"
}

function defaultModelForProvider(provider: string): string {
  switch (provider) {
    case "groq": return "llama-3.3-70b-versatile"
    case "anthropic": return "claude-3-haiku-20240307"
    case "gemini": return "gemini-1.5-flash"
    default: return "gpt-4o-mini"
  }
}

export async function getLLM(organizationId: string, options: any = {}) {
  const settings = await prisma.financialSettings.findUnique({
    where: { organizationId },
  })

  const provider = settings?.aiProvider || detectAvailableProvider()
  const model = settings?.aiModel || defaultModelForProvider(provider)
  const dbKey = settings?.aiApiKey && settings.aiApiKey.trim() !== "" ? settings.aiApiKey : undefined

  function requireKey(envVar: string, providerName: string): string {
    const key = dbKey || process.env[envVar]
    if (!key) {
      throw new Error(
        `No API key found for ${providerName}. ` +
        `Go to Settings → Financial Engine → AI Config and enter your ${providerName} API key, ` +
        `or set the ${envVar} environment variable.`
      )
    }
    return key
  }

  switch (provider) {
    case "anthropic":
      return new ChatAnthropic({
        modelName: model,
        temperature: options.temperature ?? 0.2,
        anthropicApiKey: requireKey("ANTHROPIC_API_KEY", "Anthropic"),
        ...options,
      })
    case "gemini":
      return new ChatGoogleGenerativeAI({
        modelName: model,
        temperature: options.temperature ?? 0.2,
        apiKey: requireKey("GOOGLE_API_KEY", "Google Gemini"),
        ...options,
      })
    case "groq":
      return new ChatOpenAI({
        modelName: model || "llama-3.3-70b-versatile",
        temperature: options.temperature ?? 0.2,
        openAIApiKey: requireKey("GROQ_API_KEY", "Groq"),
        configuration: {
          baseURL: "https://api.groq.com/openai/v1",
        },
        ...options,
      })
    case "ollama":
      return new ChatOllama({
        baseUrl: "http://localhost:11434",
        model: model || "llama3",
        temperature: options.temperature ?? 0.2,
        ...options,
      })
    case "openai":
    default:
      return new ChatOpenAI({
        modelName: model,
        temperature: options.temperature ?? 0.2,
        openAIApiKey: requireKey("OPENAI_API_KEY", "OpenAI"),
        ...options,
      })
  }
}

export async function callLLM(
  organizationId: string,
  messages: (BaseMessage | { role: string; content: string })[],
  feature: string,
  options: any = {}
) {
  const settings = await prisma.financialSettings.findUnique({
    where: { organizationId },
    select: { aiProvider: true, aiModel: true },
  })
  const provider = settings?.aiProvider || detectAvailableProvider()
  const model = settings?.aiModel || defaultModelForProvider(provider)

  const llm = await getLLM(organizationId, options)
  const response = await llm.invoke(messages as any)

  const usage = (response as any).usage_metadata as
    | { input_tokens?: number; output_tokens?: number; total_tokens?: number }
    | undefined
  const tokenUsage = (response as any).response_metadata?.token_usage as
    | { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
    | undefined

  const promptTokens = usage?.input_tokens ?? tokenUsage?.prompt_tokens ?? 0
  const completionTokens = usage?.output_tokens ?? tokenUsage?.completion_tokens ?? 0
  const totalTokens = usage?.total_tokens ?? tokenUsage?.total_tokens ?? (promptTokens + completionTokens)

  if (totalTokens > 0) {
    prisma.aIUsageLog.create({
      data: {
        organizationId,
        feature,
        model,
        provider,
        promptTokens,
        completionTokens,
        totalTokens,
      },
    }).catch(() => {})
  }

  return response
}
