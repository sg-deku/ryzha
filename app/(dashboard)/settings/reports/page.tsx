'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const dynamic = 'force-dynamic'

export default function ReportSchedulePage() {
  const [schedule, setSchedule] = useState({
    recipients: '',
    frequency: 'WEEKLY',
    reportType: 'FINANCIAL_DIGEST'
  })

  const saveSettings = async () => {
    await fetch('/api/settings/reports', {
      method: 'POST',
      body: JSON.stringify({
        ...schedule,
        recipients: schedule.recipients.split(',').map(e => e.trim())
      })
    })
    toast.success('Settings saved')
  }

  return (
    <div className="container mx-auto py-6 animate-fade-in">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Automated Reports</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Configure automated financial summaries for your team.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients (comma separated)</Label>
            <Input 
              id="recipients"
              placeholder="ceo@company.com, cfo@company.com"
              value={schedule.recipients}
              onChange={e => setSchedule({...schedule, recipients: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select 
              value={schedule.frequency}
              onValueChange={value => setSchedule({...schedule, frequency: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Weekly (Monday 9 AM)</SelectItem>
                <SelectItem value="MONTHLY">Monthly (1st Day)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={saveSettings} className="w-full sm:w-auto">
            Save Schedule
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
