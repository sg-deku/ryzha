import { redis } from "./redis"

export async function publishEvent(channel: string, data: any) {
  await redis.publish(channel, JSON.stringify(data))
}
