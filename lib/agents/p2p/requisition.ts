import { prisma } from "@/lib/prisma"
import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"

export async function runRequisitionAgent(requisitionData: any, organizationId: string) {
  const model = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 })

  const systemMessage = new SystemMessage(`
    You are an AI Purchase Requisition Agent. 
    Your job is to parse natural language purchase requests and extract structured data.
    Identify the requested items, estimated costs, and potential vendors.
    Check if the request is within typical budget patterns.
  `)

  const response = await model.invoke([
    systemMessage,
    new HumanMessage(`Organization ID: ${organizationId}\nRequest: ${JSON.stringify(requisitionData)}`)
  ])

  // Simple mock of structured extraction for now
  const parsedData = {
    description: requisitionData.description || "General Purchase",
    estimatedTotal: requisitionData.amount || 0,
    status: "PENDING_APPROVAL",
    organizationId
  }

  // Logic to save requisition to DB would go here
  // const requisition = await prisma.purchaseOrder.create({ data: { ...parsedData, status: 'DRAFT' } })

  return {
    agent: "Requisition Agent",
    message: "Requisition processed and pending approval.",
    data: parsedData,
    aiReasoning: response.content
  }
}
