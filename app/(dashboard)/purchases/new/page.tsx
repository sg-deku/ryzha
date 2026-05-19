"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewPurchaseOrder() {
  const router = useRouter()
  const [vendorId, setVendorId] = useState("")
  const [lineItems, setLineItems] = useState([
    { description: "", quantity: 1, unitPrice: 0 }
  ])

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0 }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: string, value: any) => {
    const newItems = [...lineItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setLineItems(newItems)
  }

  const total = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mock submit for now
    toast.success("Purchase Order created successfully")
    router.push("/purchases")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/purchases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">New Purchase Order</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input placeholder="Search vendor..." value={vendorId} onChange={(e) => setVendorId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poNumber">PO Number</Label>
                <Input defaultValue={`PO-${Date.now().toString().slice(-6)}`} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Quantity</TableHead>
                  <TableHead className="w-[150px]">Unit Price</TableHead>
                  <TableHead className="w-[150px]">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input 
                        value={item.description} 
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                        placeholder="Item description"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.unitPrice} 
                        onChange={(e) => updateLineItem(index, "unitPrice", parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell className="align-middle font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeLineItem(index)} disabled={lineItems.length === 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-4 flex justify-end">
              <div className="text-right space-y-1">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">${total.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit">Create Purchase Order</Button>
        </div>
      </form>
    </div>
  )
}
