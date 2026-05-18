"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  amount: number
}

export function InvoiceForm() {
  const router = useRouter()
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [defaultTaxRate, setDefaultTaxRate] = useState(0)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, taxRate: 0, amount: 0 }
  ])
  const [subtotal, setSubtotal] = useState(0)
  const [totalTax, setTotalTax] = useState(0)
  const [total, setTotal] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [aiInput, setAiInput] = useState("")

  useEffect(() => {
    fetch("/api/invoices")
      .then(res => res.json())
      .then(data => {
        setInvoiceNumber(data.nextNumber)
        setDefaultTaxRate(data.defaultTaxRate)
        // Apply default tax rate to existing items
        setLineItems(prev => prev.map(item => ({ ...item, taxRate: data.defaultTaxRate })))
      })
  }, [])

  useEffect(() => {
    let sub = 0
    let tax = 0
    lineItems.forEach(item => {
      sub += item.amount
      tax += (item.amount * item.taxRate) / 100
    })
    setSubtotal(sub)
    setTotalTax(tax)
    setTotal(sub + tax)
  }, [lineItems])

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      id: Math.random().toString(36).substr(2, 9), 
      description: "", 
      quantity: 1, 
      unitPrice: 0, 
      taxRate: defaultTaxRate, 
      amount: 0 
    }])
  }

  const cloneLineItem = (item: LineItem) => {
    setLineItems([...lineItems, { 
      ...item, 
      id: Math.random().toString(36).substr(2, 9) 
    }])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    const updated = lineItems.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          newItem.amount = newItem.quantity * newItem.unitPrice
        }
        return newItem
      }
      return item
    })
    setLineItems(updated)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          issueDate,
          dueDate,
          clientName,
          clientEmail,
          clientAddress: { raw: clientAddress },
          lineItems,
          subtotal,
          totalTax,
          total
        })
      })

      if (res.ok) {
        router.push("/invoices")
      } else {
        alert("Failed to save invoice")
      }
    } catch (err) {
      alert("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAndGenerate = async () => {
    setIsGenerating(true)
    try {
      // First save the invoice
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          issueDate,
          dueDate,
          clientName,
          clientEmail,
          clientAddress: { raw: clientAddress },
          lineItems,
          subtotal,
          totalTax,
          total
        })
      })

      if (res.ok) {
        const invoice = await res.json()
        // Generate PDF
        const pdfRes = await fetch(`/api/invoices/${invoice.id}/generate-pdf`, { method: "POST" })
        if (pdfRes.ok) {
          alert(`Invoice ${invoice.invoiceNumber} saved and PDF generated!`)
        } else {
          alert(`Invoice saved but PDF generation failed.`)
        }
        router.push("/invoices")
      } else {
        alert("Failed to save invoice")
      }
    } catch (err) {
      alert("An error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAISuggest = async () => {
    if (!aiInput) return
    setIsSuggesting(true)
    try {
      const res = await fetch("/api/invoices/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: aiInput, clientEmail })
      })
      if (res.ok) {
        const suggestions = await res.json()
        const newItems = suggestions.map((s: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          description: s.description,
          quantity: s.suggestedQuantity,
          unitPrice: s.suggestedUnitPrice,
          taxRate: s.recommendedTaxRate,
          amount: s.suggestedQuantity * s.suggestedUnitPrice
        }))
        setLineItems(prev => {
          // If first item is empty, replace it
          if (prev.length === 1 && !prev[0].description && prev[0].amount === 0) {
            return newItems
          }
          return [...prev, ...newItems]
        })
        setAiInput("")
      }
    } catch (err) {
      alert("AI suggestion failed")
    } finally {
      setIsSuggesting(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">New Invoice</h1>

      <div className="mb-8 p-4 bg-purple-50 border border-purple-100 rounded-lg">
        <h2 className="text-sm font-semibold text-purple-800 mb-2">AI Invoice Fill</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={aiInput} 
            onChange={e => setAiInput(e.target.value)} 
            placeholder="e.g. Website maintenance March" 
            className="flex-1 p-2 border rounded text-sm"
          />
          <button 
            onClick={handleAISuggest}
            disabled={isSuggesting || !aiInput}
            className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
          >
            {isSuggesting ? "Generating..." : "Suggest Line Items"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Invoice Number</label>
            <input 
              type="text" 
              value={invoiceNumber} 
              onChange={e => setInvoiceNumber(e.target.value)} 
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Issue Date</label>
              <input 
                type="date" 
                value={issueDate} 
                onChange={e => setIssueDate(e.target.value)} 
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client Name</label>
            <input 
              type="text" 
              value={clientName} 
              onChange={e => setClientName(e.target.value)} 
              className="w-full p-2 border rounded"
              placeholder="Company Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Client Email</label>
            <input 
              type="email" 
              value={clientEmail} 
              onChange={e => setClientEmail(e.target.value)} 
              className="w-full p-2 border rounded"
              placeholder="billing@client.com"
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Line Items</h2>
        <table className="w-full text-left mb-4">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2 w-24">Qty</th>
              <th className="px-4 py-2 w-32">Unit Price</th>
              <th className="px-4 py-2 w-24">Tax %</th>
              <th className="px-4 py-2 w-32 text-right">Amount</th>
              <th className="px-4 py-2 w-24 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lineItems.map(item => (
              <tr key={item.id}>
                <td className="p-2">
                  <input 
                    type="text" 
                    value={item.description} 
                    onChange={e => updateLineItem(item.id, "description", e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="number" 
                    value={item.quantity} 
                    onChange={e => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="number" 
                    value={item.unitPrice} 
                    onChange={e => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="number" 
                    value={item.taxRate} 
                    onChange={e => updateLineItem(item.id, "taxRate", parseFloat(e.target.value) || 0)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="p-2 text-right font-medium">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.amount)}
                </td>
                <td className="p-2 flex justify-center gap-2">
                  <button 
                    onClick={() => cloneLineItem(item)} 
                    className="text-gray-500 hover:text-gray-700"
                    title="Clone Row"
                  >
                    📑
                  </button>
                  <button 
                    onClick={() => removeLineItem(item.id)} 
                    className="text-red-500 hover:text-red-700"
                    title="Remove Row"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button 
          onClick={addLineItem}
          className="text-blue-600 font-medium hover:underline"
        >
          + Add Line Item
        </button>
      </div>

      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalTax)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span>Total</span>
            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button 
          onClick={() => router.back()} 
          className="px-6 py-2 border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving || isGenerating}
          className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save as Draft"}
        </button>
        <button 
          onClick={handleSaveAndGenerate}
          disabled={isSaving || isGenerating}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Save & Generate PDF"}
        </button>
      </div>
    </div>
  )
}
