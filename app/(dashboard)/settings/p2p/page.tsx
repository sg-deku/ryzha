"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function P2PSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("P2P settings saved")
    }, 1000)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">P2P Settings</h2>
      </div>
      <Separator />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Approval Workflow</CardTitle>
            <CardDescription>Configure how purchase orders and invoices are approved.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Approve Low Value POs</Label>
                <p className="text-sm text-muted-foreground">POs below the threshold will be approved automatically.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 pt-2">
              <Label htmlFor="limit">Auto-Approve Limit ($)</Label>
              <Input type="number" id="limit" defaultValue="500" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Three-Way Matching</Label>
                <p className="text-sm text-muted-foreground">Require invoice to match both PO and Receiving records.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Early Payment Discounts</CardTitle>
            <CardDescription>Optimize cash flow by capturing vendor discounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alert on Discount Opportunities</Label>
                <p className="text-sm text-muted-foreground">Notify when early payment would result in significant savings.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
