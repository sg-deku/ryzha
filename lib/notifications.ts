import { prisma } from "@/lib/prisma"
import axios from "axios"

export async function sendVoiceSummary(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { organization: true }
  })
  if (!transaction) return

  const amount = transaction.amount
  const runwayDays = Math.round((transaction.runwayMonths || 0) * 30)
  const zeroCashDate = transaction.zeroCashDate?.toLocaleDateString() || "unknown"
  const percentAhead = transaction.percentAhead || 0

  const script = `Karina, a $${amount} credit has been reconciled under ASC 606. This improves our net income for the quarter and extends our cash runway by ${runwayDays} days, moving our “Zero Cash Date” to ${zeroCashDate}. We are currently ${percentAhead > 0 ? `${percentAhead.toFixed(0)}% ahead` : `${Math.abs(percentAhead).toFixed(0)}% behind`} of our financial plan.`

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
  const VOICE_ID = "21m00Tcm4TlvDq8ikWAM" // Rachel voice

  if (!ELEVENLABS_API_KEY) {
    console.warn("ELEVENLABS_API_KEY not set, skipping voice summary")
    return
  }

  try {
    await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text: script,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    )
    // In a real app, you'd save this buffer to S3 and notify the UI via SSE
    console.log("ElevenLabs voice summary generated")
  } catch (error) {
    console.error("ElevenLabs error:", error)
  }
}

export async function sendSMSNotification(transactionId: string) {
  // Mock SMS notification
  console.log(`SMS Notification sent for transaction ${transactionId}`)
}
