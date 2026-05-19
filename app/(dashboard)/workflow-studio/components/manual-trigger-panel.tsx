"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export function ManualTriggerPanel({ onTrigger }: { onTrigger: (id: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("1000")
  const [description, setDescription] = useState("Annual Subscription")

  const handleTrigger = async (type: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/workflow-studio/manual-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload: { amount, description } })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Workflow triggered successfully`)
        if (data.executionId) onTrigger(data.executionId)
      } else {
        toast.error(data.error || "Failed to trigger workflow")
      }
    } catch (e) {
      toast.error("Failed to trigger workflow")
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Workflow Trigger</CardTitle>
        <CardDescription>Select a workflow type to simulate an event and run agents.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stripe" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stripe">Stripe Payment</TabsTrigger>
            <TabsTrigger value="p2p">P2P Invoice</TabsTrigger>
            <TabsTrigger value="o2c">O2C Sales Order</TabsTrigger>
          </TabsList>

          <TabsContent value="stripe" className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} />
              </div>
            </div>
            <Button onClick={() => handleTrigger("stripe")} disabled={loading}>
              Trigger Stripe Workflow
            </Button>
          </TabsContent>

          <TabsContent value="p2p" className="space-y-4 pt-4 border-t">
             <div className="text-sm text-muted-foreground">Creates a mock vendor invoice and runs P2P agents.</div>
             <Button onClick={() => handleTrigger("p2p")} disabled={loading}>
              Trigger P2P Workflow
            </Button>
          </TabsContent>

          <TabsContent value="o2c" className="space-y-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">Creates a mock sales order and runs O2C agents.</div>
             <Button onClick={() => handleTrigger("o2c")} disabled={loading}>
              Trigger O2C Workflow
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
