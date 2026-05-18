'use client'

import { useState } from 'react'

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
    alert('Settings saved')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Automated Reports</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Recipients (comma separated)</label>
          <input 
            className="w-full p-2 border rounded" 
            placeholder="ceo@company.com, cfo@company.com"
            value={schedule.recipients}
            onChange={e => setSchedule({...schedule, recipients: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Frequency</label>
          <select 
            className="w-full p-2 border rounded"
            value={schedule.frequency}
            onChange={e => setSchedule({...schedule, frequency: e.target.value})}
          >
            <option value="WEEKLY">Weekly (Monday 9 AM)</option>
            <option value="MONTHLY">Monthly (1st Day)</option>
          </select>
        </div>

        <button 
          onClick={saveSettings}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Save Schedule
        </button>
      </div>
    </div>
  )
}
