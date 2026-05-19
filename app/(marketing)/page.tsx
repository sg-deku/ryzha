import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 lg:py-32 flex flex-col items-center text-center px-4">
        <div className="max-w-3xl space-y-6 animate-fade-up">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Financial brain for <span className="text-primary">startups</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
            AI‑powered accounting, audit, and runway forecasting. 
            Real-time financial intelligence for modern founders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {session ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Start free trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-xl shadow-sm border animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Real-time Insights</h3>
              <p className="text-muted-foreground">
                Get instant visibility into your cash flow and spending as it happens.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-xl shadow-sm border animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Automated Audit</h3>
              <p className="text-muted-foreground">
                Every transaction is verified and hashed for bulletproof audit trails.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-xl shadow-sm border animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Runway Forecast</h3>
              <p className="text-muted-foreground">
                Predict your future cash position with AI-driven runway analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 px-4">
        <div className="max-w-4xl mx-auto bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-2xl animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to scale smarter?</h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Join 500+ startups managing their finances with Ryzha's AI brain.
          </p>
          <Button size="lg" variant="secondary" asChild className="font-bold">
            <Link href="/signup">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
