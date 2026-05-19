"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const dynamic = 'force-dynamic'

export default function IntegrationsPage() {
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    const [wRes, lRes] = await Promise.all([
      fetch("/api/webhooks/settings"),
      fetch("/api/webhooks/logs")
    ])
    if (wRes.ok) setWebhooks(await wRes.json())
    if (lRes.ok) setLogs(await lRes.json())
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/webhooks/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, events: ["invoice.paid"] })
      })
      if (res.ok) {
        setUrl("")
        fetchData()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch("/api/webhooks/settings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
    fetchData()
  }

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Integrations</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Connect Ryzha with your existing tools and workflows.</p>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Webhooks</h2>
            <form onSubmit={handleCreate} className="flex gap-2">
              <Input 
                type="url" 
                placeholder="https://your-api.com/webhook" 
                value={url}
                onChange={e => setUrl(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Endpoint"}
              </Button>
            </form>

            <div className="grid gap-4">
              {webhooks.map(w => (
                <div key={w.id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
                  <div className="space-y-1">
                    <p className="font-medium">{w.url}</p>
                    <div className="flex gap-2 items-center">
                       <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{w.secret}</code>
                       <span className="text-xs text-muted-foreground">• {w.events.join(", ")}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(w.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {webhooks.length === 0 && (
                <div className="text-center py-6 border rounded-lg border-dashed text-muted-foreground">
                  No webhook endpoints configured.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Delivery Logs</h2>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Endpoint</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{log.event}</TableCell>
                      <TableCell>
                        <Badge variant={log.success ? "secondary" : "destructive"}>
                          {log.statusCode || 'ERROR'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[200px]">
                        {log.webhook.url}
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No webhook deliveries yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
