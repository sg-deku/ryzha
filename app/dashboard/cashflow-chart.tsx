"use client"

import { useState, useEffect } from "react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export function CashFlowForecast() {
  const [forecast, setForecast] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [whatIfDesc, setWhatIfDesc] = useState("")
  const [whatIfAmount, setWhatIfAmount] = useState("")
  const [scenarios, setScenarios] = useState<any[]>([])

  const fetchForecast = async (currentScenarios = scenarios) => {
    setLoading(true)
    try {
      const res = await fetch("/api/forecast/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentBalance: 15000,
          whatIfScenarios: currentScenarios 
        })
      })
      if (res.ok) {
        const data = await res.json()
        setForecast(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecast()
  }, [])

  const handleAddScenario = () => {
    if (!whatIfDesc || !whatIfAmount) return
    const newScenarios = [...scenarios, { description: whatIfDesc, amount: parseFloat(whatIfAmount), frequency: "monthly" }]
    setScenarios(newScenarios)
    setWhatIfDesc("")
    setWhatIfAmount("")
    fetchForecast(newScenarios)
  }

  if (loading && !forecast) return <div className="p-8 text-center bg-white rounded-xl border">Analysing data and projecting cash flow...</div>

  // Add confidence interval mock if not present
  const chartData = forecast?.dailyForecast?.map((day: any) => ({
    ...day,
    date: day.date.split('-').slice(1).join('/'),
    confidenceRange: [day.balance * 0.9, day.balance * 1.1]
  })) || []

  return (
    <div className="p-6 space-y-6 bg-white rounded-xl border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">AI Cash Flow Forecast (90 Days)</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="What if: Add new hire" 
            className="p-2 border rounded text-sm flex-1 sm:w-auto"
            value={whatIfDesc}
            onChange={e => setWhatIfDesc(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Amount" 
            className="p-2 border rounded text-sm w-24"
            value={whatIfAmount}
            onChange={e => setWhatIfAmount(e.target.value)}
          />
          <button 
            onClick={handleAddScenario}
            className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 whitespace-nowrap"
            disabled={loading}
          >
            {loading ? "..." : "Re-forecast"}
          </button>
        </div>
      </div>

      {forecast && (
        <div className="space-y-6">
          <div className="h-[300px] w-full" data-testid="cashflow-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#93c5fd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#6b7280" }} 
                  tickFormatter={(val) => `$${val/1000}k`} 
                  dx={-10}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip 
                  formatter={(value: any, name: any) => {
                    if (name === "confidenceRange") return null
                    return [`$${Number(value).toLocaleString()}`, "Predicted Balance"]
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="confidenceRange" 
                  stroke="none" 
                  fill="url(#colorConfidence)" 
                  isAnimationActive={true} 
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fill="url(#colorBalance)" 
                  isAnimationActive={true} 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>🔄</span> Recurring Expenses Identified
              </h3>
              <div className="space-y-2">
                {forecast.recurringExpenses?.map((ex: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded flex justify-between items-center text-sm">
                    <span>{ex.description}</span>
                    <span className="font-bold">${ex.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>⚠️</span> Late Payment Risks
              </h3>
              <div className="space-y-2">
                {forecast.latePaymentRisks?.map((risk: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded flex justify-between items-center text-sm">
                    <span>{risk.client}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      risk.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {risk.riskLevel} Risk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="text-sm font-bold text-blue-800 mb-2">AI Insights</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              {forecast.insights?.map((insight: string, i: number) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
