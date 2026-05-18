"use client"

import { useState, useEffect } from "react"

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
          currentBalance: 15000, // Mock current balance
          whatIfScenarios: currentScenarios 
        })
      })
      if (res.ok) {
        setForecast(await res.json())
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

  if (loading) return <div className="p-8 text-center">Analysing data and projecting cash flow...</div>

  return (
    <div className="p-6 space-y-6 bg-white rounded-xl border">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">AI Cash Flow Forecast (90 Days)</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="What if: Add new hire" 
            className="p-2 border rounded text-sm"
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
            className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
          >
            Re-forecast
          </button>
        </div>
      </div>

      {forecast && (
        <div className="space-y-6">
          {/* Simple SVG Chart Placeholder */}
          <div className="h-64 bg-gray-50 border rounded-lg flex items-end p-4 relative">
             <div className="absolute top-4 left-4 flex gap-4">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span className="text-xs text-gray-500">Predicted Balance</span>
                </div>
             </div>
             {/* Chart Line would go here. For MVP we show balance points */}
             <div className="w-full flex justify-between items-end h-full">
                {forecast.dailyForecast?.filter((_: any, i: number) => i % 15 === 0).map((day: any, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-2 group relative">
                    <div 
                      className="w-4 bg-blue-500 rounded-t" 
                      style={{ height: `${Math.max(10, (day.balance / 30000) * 100)}%` }}
                    ></div>
                    <span className="text-[10px] text-gray-400 -rotate-45">{day.date.split('-').slice(1).join('/')}</span>
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white p-1 rounded text-[10px] whitespace-nowrap">
                      ${day.balance.toLocaleString()}
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
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
