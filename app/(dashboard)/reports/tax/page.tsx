"use client"

import { useState, useEffect } from "react"

export const dynamic = 'force-dynamic'

export default function TaxReportPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1)
  const [jurisdiction, setJurisdiction] = useState("")
  const [taxRate, setTaxRate] = useState("")
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    const startDate = new Date(year, (quarter - 1) * 3, 1).toISOString()
    const endDate = new Date(year, quarter * 3, 0).toISOString()
    
    let url = `/api/reports/tax?startDate=${startDate}&endDate=${endDate}`
    if (jurisdiction) url += `&jurisdiction=${jurisdiction}`
    if (taxRate) url += `&taxRate=${taxRate}`
    
    try {
      const res = await fetch(url)
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
  }, [year, quarter, jurisdiction, taxRate])

  const getExportUrl = (type: 'csv' | 'pdf') => {
    const startDate = new Date(year, (quarter - 1) * 3, 1).toISOString()
    const endDate = new Date(year, quarter * 3, 0).toISOString()
    let url = `/api/reports/tax/export${type === 'pdf' ? '-pdf' : ''}?startDate=${startDate}&endDate=${endDate}`
    if (jurisdiction) url += `&jurisdiction=${jurisdiction}`
    if (taxRate) url += `&taxRate=${taxRate}`
    return url
  }

  const handleExportCSV = () => window.open(getExportUrl('csv'))
  const handleExportPDF = () => window.open(getExportUrl('pdf'))

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tax Report</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
          >
            Download PDF
          </button>
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {report?.safeHarborWarning && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="font-medium text-sm">{report.safeHarborWarning}</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 border rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Quarter</label>
          <select 
            value={quarter} 
            onChange={(e) => setQuarter(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={1}>Q1 (Jan - Mar)</option>
            <option value={2}>Q2 (Apr - Jun)</option>
            <option value={3}>Q3 (Jul - Sep)</option>
            <option value={4}>Q4 (Oct - Dec)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Jurisdiction (ISO)</label>
          <input 
            type="text"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value.toUpperCase())}
            placeholder="e.g. DE, NY"
            maxLength={2}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tax Rate %</label>
          <input 
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            placeholder="e.g. 19"
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading report...</div>
      ) : report ? (
        <div className="space-y-8">
          <div className="grid grid-cols-4 gap-6">
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Total Sales</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(report.totalSales)}
              </p>
            </div>
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Tax Collected</p>
              <p className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(report.totalTaxCollected)}
              </p>
            </div>
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Deductible Tax</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(report.totalDeductibleTax)}
              </p>
            </div>
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
              <p className="text-sm text-blue-600 mb-1">Net Tax Owed</p>
              <p className="text-2xl font-bold text-blue-800">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(report.netOwed)}
              </p>
            </div>
          </div>

          {Object.keys(report.salesByRate).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Sales by Tax Rate</h2>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(report.salesByRate).map(([rate, data]: [string, any]) => (
                  <div key={rate} className="p-4 bg-gray-50 border rounded-lg">
                    <p className="text-sm font-semibold text-gray-600">{rate}% Rate</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500">Sales: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.sales)}</p>
                      <p className="text-xs text-gray-500">Tax: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.tax)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4">Transaction Breakdown</h2>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-sm font-medium text-gray-600">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Reference</th>
                    <th className="px-6 py-3">Jurisdiction</th>
                    <th className="px-6 py-3">Rate</th>
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
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {row.jurisdiction}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.rate}%</td>
                      <td className="px-6 py-4 text-right">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.amount)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.tax)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
