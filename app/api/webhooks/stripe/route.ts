import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { startAgentWorkflow } from "@/lib/agents/orchestrator"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const stripe = getStripe()
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any
    const { id, amount, currency, description, customer_email, metadata } = paymentIntent

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        stripePaymentIntentId: id,
        amount: amount / 100, // convert cents to dollars
        currency,
        description: description || metadata?.product_description || "Subscription payment",
        customerEmail: customer_email || metadata?.customer_email,
        organizationId: metadata?.organizationId || "default-org", // you should pass org ID in metadata
        workflowStatus: "running",
        agentLogs: [],
      }
    })

    // Start the agent workflow asynchronously (don't await)
    startAgentWorkflow(transaction.id).catch(console.error)
  }

  return NextResponse.json({ received: true })
}
