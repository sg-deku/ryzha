import { getLLM } from "@/lib/ai/llm"

export async function runInvoiceCaptureAgent(invoiceImage: string, organizationId: string) {
  const model = await getLLM(organizationId, { modelName: "gpt-4o-mini", temperature: 0 })

  // Mocking OCR + LLM extraction
  const systemPrompt = "Extract vendor, amount, date, and line items from this invoice image data."
  
  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Invoice Image Data: ${invoiceImage}` }
  ])

  return {
    agent: "Invoice Capture Agent",
    extractedData: {
      vendor: "Acme Corp",
      amount: 1250.00,
      date: "2024-05-19",
      lineItems: [
        { description: "Cloud Services", amount: 1250.00 }
      ]
    },
    aiReasoning: response.content
  }
}
