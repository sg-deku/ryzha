"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function O2CSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("O2C settings saved")
    }, 1000)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">O2C Settings</h2>
      </div>
      <Separator />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Credit Management</CardTitle>
            <CardDescription>Manage customer risk and credit availability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="credit">Default Credit Limit ($)</Label>
              <Input type="number" id="credit" defaultValue="5000" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Hold Orders</Label>
                <p className="text-sm text-muted-foreground">Place orders on hold if customer is over their credit limit.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collections & Dunning</CardTitle>
            <CardDescription>Configure automated payment reminders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Automated Dunning</Label>
                <p className="text-sm text-muted-foreground">Automatically send reminders for past-due invoices.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 pt-2">
              <Label htmlFor="frequency">First Reminder (Days After Due)</Label>
              <Input type="number" id="frequency" defaultValue="3" />
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
