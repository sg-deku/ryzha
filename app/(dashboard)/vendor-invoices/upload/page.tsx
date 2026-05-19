"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Upload, FileText } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function UploadVendorInvoice() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return toast.error("Please select a file to upload")
    
    // Mock submit for now
    toast.success("Invoice uploaded and processing started")
    router.push("/vendor-invoices")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vendor-invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Upload Vendor Invoice</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Document</CardTitle>
            <CardDescription>Upload a PDF or image of the vendor invoice for AI processing.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <Label htmlFor="file" className="cursor-pointer">
                  <span className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                    Select File
                  </span>
                  <Input 
                    id="file" 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.png,.jpg,.jpeg" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  />
                </Label>
                <p className="text-sm text-muted-foreground mt-4">
                  {file ? file.name : "or drag and drop it here"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={!file}>
            <Upload className="mr-2 h-4 w-4" /> Upload & Process
          </Button>
        </div>
      </form>
    </div>
  )
}
