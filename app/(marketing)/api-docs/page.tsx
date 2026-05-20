import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export const dynamic = 'force-static'

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">API Documentation</h1>
        <p className="text-xl text-muted-foreground">
          Integrate Ryzha's financial brain directly into your own applications using our REST API.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="hidden md:block col-span-1">
          <div className="sticky top-24 space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Getting Started</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#authentication" className="hover:text-primary transition-colors">Authentication</a></li>
                <li><a href="#webhooks" className="hover:text-primary transition-colors">Webhooks</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Endpoints</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#reports" className="hover:text-primary transition-colors">AI Reports</a></li>
                <li><a href="#dashboard" className="hover:text-primary transition-colors">Dashboard Stats</a></li>
                <li><a href="#workflow" className="hover:text-primary transition-colors">Workflows</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-span-3 space-y-12">
          {/* Authentication */}
          <section id="authentication" className="space-y-4 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">Authentication</h2>
            <p className="text-muted-foreground">
              Our API uses session-based authentication for frontend clients and API keys for backend integrations (coming soon).
              For now, all endpoints require an active authenticated session.
            </p>
          </section>

          {/* Webhooks */}
          <section id="webhooks" className="space-y-4 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">Webhooks</h2>
            <p className="text-muted-foreground">
              Ryzha listens to Stripe webhooks to automatically trigger internal agents (Order-to-Cash, Procure-to-Pay).
            </p>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary uppercase">POST</Badge>
                  <CardTitle className="font-mono text-base">/api/webhooks/stripe</CardTitle>
                </div>
                <CardDescription>Receives Stripe events (payment_intent.succeeded, charge.succeeded, etc.)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  To test locally, forward your Stripe webhooks to this endpoint:
                </p>
                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm">
                    <code>stripe listen --forward-to localhost:3000/api/webhooks/stripe</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Reports API */}
          <section id="reports" className="space-y-4 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">AI Reports API</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 uppercase">POST</Badge>
                  <CardTitle className="font-mono text-base">/api/reports/ask</CardTitle>
                </div>
                <CardDescription>Ask natural language questions about your financial data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Request Body</h4>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm"><code>{`{
  "query": "Show me revenue by month",
}`}</code></pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Response</h4>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm"><code>{`{
  "data": [...],
  "summary": "Revenue has increased by 15% month-over-month...",
  "chartType": "line"
}`}</code></pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Dashboard API */}
          <section id="dashboard" className="space-y-4 scroll-mt-24">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Stats API</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 uppercase">GET</Badge>
                  <CardTitle className="font-mono text-base">/api/dashboard/stats</CardTitle>
                </div>
                <CardDescription>Retrieve aggregated KPIs and sparkline data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Response</h4>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm"><code>{`[
  {
    "title": "MRR",
    "value": "$15.0K",
    "change": "+12.5%",
    "data": [10000, 11000, 12000, 15000, ...]
  },
  ...
]`}</code></pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </div>
  )
}