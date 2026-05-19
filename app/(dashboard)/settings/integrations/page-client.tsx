"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Trash2, Plus, Activity, Globe } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function IntegrationsPage() {
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      const [wRes, lRes] = await Promise.all([
        fetch("/api/webhooks/settings"),
        fetch("/api/webhooks/logs")
      ])
      if (wRes.ok) setWebhooks(await wRes.json())
      if (lRes.ok) setLogs(await lRes.json())
    } catch (error) {
      toast.error("Failed to fetch integration data")
    }
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
        toast.success("Webhook endpoint added successfully")
        fetchData()
      } else {
        toast.error("Failed to add webhook endpoint")
      }
    } catch (error) {
      toast.error("An error occurred while adding webhook")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/webhooks/settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        toast.success("Webhook endpoint deleted")
        fetchData()
      } else {
        toast.error("Failed to delete webhook endpoint")
      }
    } catch (error) {
      toast.error("An error occurred while deleting webhook")
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">Connect Ryzha with your existing tools and workflows.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Webhook</CardTitle>
              <CardDescription>Configure a new endpoint to receive real-time notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Endpoint URL</label>
                  <Input 
                    type="url" 
                    placeholder="https://api.example.com/webhook" 
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  {loading ? "Adding..." : "Add Endpoint"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {webhooks.map(w => (
                  <div key={w.id} className="p-4 flex justify-between items-center group">
                    <div className="space-y-1 overflow-hidden">
                      <p className="font-medium text-sm truncate">{w.url}</p>
                      <div className="flex gap-2 items-center">
                         <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono truncate">{w.secret}</code>
                      </div>
                    </div>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(w.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {webhooks.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground italic">
                    No active endpoints.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Delivery Logs</CardTitle>
                <CardDescription>Recent activity from your webhook endpoints.</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="pr-6">Endpoint</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="pl-6 font-medium">{log.event}</TableCell>
                      <TableCell>
                        <Badge variant={log.success ? "secondary" : "destructive"} className="font-mono">
                          {log.statusCode || 'ERROR'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[150px] text-xs pr-6">
                        {log.webhook.url}
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                        No webhook deliveries recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
