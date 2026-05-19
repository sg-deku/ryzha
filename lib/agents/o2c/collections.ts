import { prisma } from "@/lib/prisma"
import { getLLM } from "@/lib/ai/llm"

export async function runCollectionsAgent(organizationId: string) {
  // Find overdue invoices (sales orders that are INVOICED but not PAID and past due)
  const overdueOrders = await prisma.salesOrder.findMany({
    where: {
      organizationId,
      status: "INVOICED",
      createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Over 30 days old
    },
    include: { customer: true }
  })

  const results = []

  for (const order of overdueOrders) {
    let action = "LOG_OVERDUE"
    let dunningMessage = ""

    if (process.env.OPENAI_API_KEY) {
      try {
        const model = await getLLM(organizationId, {
          modelName: "gpt-4o-mini",
          temperature: 0.7,
        })

        const response = await model.invoke([
          {
            role: "system",
            content: "Generate a polite but firm dunning message for an overdue invoice. Respond in JSON with { message: string }."
          },
          {
            role: "user",
            content: `Customer: ${order.customer.name}, Amount: $${order.totalAmount}, Days Overdue: 30+`
          }
        ])

        const parsed = JSON.parse(response.content as string)
        dunningMessage = parsed.message
        action = "SEND_DUNNING"
      } catch (e) {
        console.error("Collections AI failed", e)
      }
    }

    results.push({
      orderId: order.id,
      customer: order.customer.name,
      amount: order.totalAmount,
      action,
      message: dunningMessage
    })
  }

  return results
}
