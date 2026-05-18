"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function UploadExpensesForm() {
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({
    date: "",
    description: "",
    amount: ""
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const firstLine = text.split("\n")[0]
        const cols = firstLine.split(",").map(c => c.trim())
        setHeaders(cols)
        
        // Auto-mapping attempt
        const newMapping: Record<string, string> = { ...mapping }
        cols.forEach(col => {
          const c = col.toLowerCase()
          if (c.includes("date")) newMapping.date = col
          if (c.includes("desc")) newMapping.description = col
          if (c.includes("amount") || c.includes("value")) newMapping.amount = col
        })
        setMapping(newMapping)
      }
      reader.readAsText(file)
    }
  }, [file])

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    
    const finalMapping: Record<string, string> = {}
    Object.entries(mapping).forEach(([field, header]) => {
      if (header) finalMapping[header] = field
    })

    const formData = new FormData()
    formData.append("file", file)
    formData.append("mapping", JSON.stringify(finalMapping))
    
    try {
      const res = await fetch("/api/expenses/upload/csv", { 
        method: "POST", 
        body: formData 
      })
      if (res.ok) {
        router.push("/expenses")
      } else {
        const err = await res.json()
        alert("Upload failed: " + err.error)
      }
    } catch (e) {
      alert("An error occurred during upload")
    } finally {
      setLoading(false)
    }
  }

  const handleMappingChange = (field: string, header: string) => {
    setMapping(prev => ({ ...prev, [field]: header }))
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Expenses CSV</h1>
      
      <div className="space-y-6 bg-white p-6 border rounded shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Select CSV File</label>
          <input 
            type="file" 
            accept=".csv" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            className="w-full p-2 border rounded"
          />
        </div>

        {headers.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Map Columns</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date Column</label>
                <select 
                  value={mapping.date} 
                  onChange={(e) => handleMappingChange("date", e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select...</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description Column</label>
                <select 
                  value={mapping.description} 
                  onChange={(e) => handleMappingChange("description", e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select...</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount Column</label>
                <select 
                  value={mapping.amount} 
                  onChange={(e) => handleMappingChange("amount", e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select...</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={handleUpload}
          disabled={!file || !mapping.date || !mapping.description || !mapping.amount || loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Uploading..." : "Upload Expenses"}
        </button>
      </div>
    </div>
  )
}
