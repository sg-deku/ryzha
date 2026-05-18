"use client"

import { useState, useEffect } from "react"

export default function TaxReportPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1)
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    const startDate = new Date(year, (quarter - 1) * 3, 1).toISOString()
    const endDate = new Date(year, quarter * 3, 0).toISOString()
    
    try {
      const res = await fetch(`/api/reports/tax?startDate=${startDate}&endDate=${endDate}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [year, quarter])

  const handleExport = () => {
    const startDate = new Date(year, (quarter - 1) * 3, 1).toISOString()
    const endDate = new Date(year, quarter * 3, 0).toISOString()
    window.open(`/api/reports/tax/export?startDate=${startDate}&endDate=${endDate}`)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tax Report</h1>
        <button 
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>

      <div className="flex gap-4 mb-8 p-4 bg-gray-50 border rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="p-2 border rounded"
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Quarter</label>
          <select 
            value={quarter} 
            onChange={(e) => setQuarter(parseInt(e.target.value))}
            className="p-2 border rounded"
          >
            <option value={1}>Q1 (Jan - Mar)</option>
            <option value={2}>Q2 (Apr - Jun)</option>
            <option value={3}>Q3 (Jul - Sep)</option>
            <option value={4}>Q4 (Oct - Dec)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading report...</div>
      ) : report ? (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Output Tax (Sales)</p>
              <p className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(report.outputTax)}
              </p>
            </div>
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Input Tax (Expenses)</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(report.inputTax)}
              </p>
            </div>
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
              <p className="text-sm text-blue-600 mb-1">Net Tax Owed</p>
              <p className="text-2xl font-bold text-blue-800">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(report.netOwed)}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Transaction Breakdown</h2>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-sm font-medium text-gray-600">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Reference</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-right">Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {report.details.map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="px-6 py-4">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium">{row.reference}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          row.type === 'INVOICE' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.amount)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.tax)}
                      </td>
                    </tr>
                  ))}
                  {report.details.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No transactions found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
