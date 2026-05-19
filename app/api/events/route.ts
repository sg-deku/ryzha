import { NextRequest } from "next/server"
import Redis from "ioredis"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get("orgId")

  if (!orgId) {
    return new Response("Missing orgId", { status: 400 })
  }

  const responseStream = new TransformStream()
  const writer = responseStream.writable.getWriter()
  const encoder = new TextEncoder()

  const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
  const channel = `org:${orgId}:events`

  subscriber.subscribe(channel, (err) => {
    if (err) {
      console.error("Failed to subscribe:", err)
    }
  })

  subscriber.on("message", (chan, message) => {
    if (chan === channel) {
      writer.write(encoder.encode(`data: ${message}\n\n`))
    }
  })

  req.signal.onabort = () => {
    subscriber.quit()
    writer.close()
  }

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
