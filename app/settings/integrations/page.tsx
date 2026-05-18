"use client"

import { useState, useEffect } from "react"

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
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold">Integrations</h1>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Webhooks</h2>
        <form onSubmit={handleCreate} className="flex gap-2 p-4 bg-gray-50 border rounded-lg">
          <input 
            type="url" 
            placeholder="https://your-api.com/webhook" 
            className="flex-1 p-2 border rounded"
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Add Endpoint
          </button>
        </form>

        <div className="space-y-4">
          {webhooks.map(w => (
            <div key={w.id} className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm">
              <div className="space-y-1">
                <p className="font-medium">{w.url}</p>
                <div className="flex gap-2">
                   <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{w.secret}</code>
                   <span className="text-xs text-gray-500">• {w.events.join(", ")}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(w.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Delivery Logs</h2>
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-xs uppercase font-bold text-gray-500">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Endpoint</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="px-6 py-4 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium">{log.event}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      log.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.statusCode || 'ERROR'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 truncate max-w-[200px]">{log.webhook.url}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No webhook deliveries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
