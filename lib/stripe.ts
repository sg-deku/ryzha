import Stripe from "stripe"

let stripeInstance: Stripe | null = null

// Use getStripe() inside your functions to avoid top-level instantiation during build
export const getStripe = () => {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey && process.env.NODE_ENV === "production") {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }
    stripeInstance = new Stripe(apiKey || "dummy_key", {
      apiVersion: "2025-01-27.acacia" as any,
      typescript: true,
    })
  }
  return stripeInstance
}
