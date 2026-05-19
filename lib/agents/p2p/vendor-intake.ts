import { prisma } from "@/lib/prisma"
import { getLLM } from "@/lib/ai/llm"

export async function runVendorIntakeAgent(organizationId: string, input: { name?: string, email?: string, text?: string }) {
  let name = input.name || "Unknown Vendor"
  let email = input.email
  let taxId = ""
  let address = {}

  if (input.text && process.env.OPENAI_API_KEY) {
    try {
      const model = await getLLM(organizationId, {
        modelName: "gpt-4o-mini",
        temperature: 0,
      })

      const response = await model.invoke([
        {
          role: "system",
          content: "Extract vendor details (name, email, taxId, address) from the provided text. Respond in JSON."
        },
        {
          role: "user",
          content: input.text
        }
      ])

      try {
        const parsed = JSON.parse(response.content as string)
        name = parsed.name || name
        email = parsed.email || email
        taxId = parsed.taxId || ""
        address = parsed.address || {}
      } catch (e) {
        console.error("Failed to parse vendor data", e)
      }
    } catch (error) {
      console.error("Vendor Intake AI failed", error)
    }
  }

  // Duplicate detection via name or email
  const existing = await prisma.vendor.findFirst({
    where: {
      organizationId,
      OR: [
        { name: { equals: name, mode: "insensitive" } },
        { email: { equals: email, mode: "insensitive" } }
      ]
    }
  })

  if (existing) {
    return { vendor: existing, isNew: false }
  }

  const vendor = await prisma.vendor.create({
    data: {
      name,
      email,
      taxId,
      address,
      organizationId,
    }
  })

  return { vendor, isNew: true }
}
