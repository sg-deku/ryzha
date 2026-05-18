"use client"

import { useState } from "react"

interface AnomalyProps {
  anomaly: any
  onResolve: () => void
}

export function AnomalyCard({ anomaly, onResolve }: AnomalyProps) {
  const [loading, setLoading] = useState(false)

  const handleAction = async (status: string, isFalsePositive = false) => {
    setLoading(true)
    try {
      await fetch("/api/expenses/alert", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: anomaly.id, status, isFalsePositive })
      })
      onResolve()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-4 items-start">
      <div className="p-2 bg-red-100 rounded-full text-red-600">
        ⚠️
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-red-800">{anomaly.type.replace('_', ' ')}</h4>
          <span className="text-xs text-red-600 font-medium">
            {new Date(anomaly.expense.date).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-red-700 mt-1">{anomaly.description}</p>
        <p className="text-xs text-red-600 mt-1">
          {anomaly.expense.description} — <span className="font-bold">${anomaly.expense.amount}</span>
        </p>
        <div className="mt-3 flex gap-2">
          <button 
            disabled={loading}
            onClick={() => handleAction('REVIEWED')}
            className="px-3 py-1 bg-white border border-red-200 text-red-700 rounded text-xs hover:bg-red-100"
          >
            Mark Reviewed
          </button>
          <button 
            disabled={loading}
            onClick={() => handleAction('DISMISSED', true)}
            className="px-3 py-1 text-red-500 text-xs hover:underline"
          >
            False Positive
          </button>
        </div>
      </div>
    </div>
  )
}
