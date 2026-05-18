"use client"

import { useState } from "react"
import Link from "next/link"
import { Upload, Brain, Sparkles, Filter, MoreHorizontal, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExpenseTable } from "@/components/expenses/expense-table"
import { AICategorizeProgress } from "@/components/expenses/ai-categorize-progress"
import { CategoryChart } from "@/components/expenses/category-chart"
import { Card, CardContent } from "@/components/ui/card"

interface Expense {
  id: string
  date: string
  description: string
  amount: number
  category: string | null
  status: string
}

interface ExpensesClientProps {
  initialExpenses: Expense[]
  chartData: { name: string; value: number }[]
}

export function ExpensesClient({ initialExpenses, chartData }: ExpensesClientProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const totalToProcess = initialExpenses.filter(e => e.status === 'PENDING').length

  const handleCategorizeAll = async () => {
    if (totalToProcess === 0) return
    
    setIsProcessing(true)
    setProcessedCount(0)
    
    // Simulate batch processing with polling/updates
    for (let i = 1; i <= totalToProcess; i++) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setProcessedCount(i)
    }
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and categorize your business spending.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" asChild>
            <Link href="/expenses/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </Link>
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleCategorizeAll}
            disabled={isProcessing || totalToProcess === 0}
          >
            <Brain className="mr-2 h-4 w-4" />
            Categorize All ({totalToProcess})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <AICategorizeProgress 
            isProcessing={isProcessing}
            totalItems={totalToProcess}
            processedItems={processedCount}
            onComplete={() => setIsProcessing(false)}
          />
          
          <Card className="h-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none shadow-lg">
            <CardContent className="p-8 flex flex-col justify-between h-full min-h-[200px]">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Monthly Spending</p>
                <h2 className="text-4xl font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    initialExpenses.reduce((sum, e) => sum + e.amount, 0)
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-4 text-sm text-blue-100">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span>{totalToProcess} pending review</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-blue-300" />
                <span>Last updated just now</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <CategoryChart 
            data={chartData} 
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>

      <ExpenseTable 
        initialExpenses={initialExpenses} 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
    </div>
  )
}
