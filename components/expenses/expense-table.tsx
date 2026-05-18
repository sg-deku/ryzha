"use client"

import { useState, useMemo } from "react"
import { TableVirtuoso } from "react-virtuoso"
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Brain, 
  CheckCircle2, 
  Trash2,
  ChevronDown
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CategoryCell } from "./category-cell"
import { AICategorizeButton } from "./ai-categorize-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Expense {
  id: string
  date: string | Date
  description: string
  amount: number
  category: string | null
  status: string
}

interface ExpenseTableProps {
  initialExpenses: Expense[]
}

export function ExpenseTable({ initialExpenses }: ExpenseTableProps) {
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const filteredExpenses = useMemo(() => {
    return initialExpenses.filter(e => 
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.category?.toLowerCase() || "").includes(search.toLowerCase())
    )
  }, [initialExpenses, search])

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredExpenses.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredExpenses.map(e => e.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-4 h-[calc(100vh-280px)] flex flex-col">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
        <div className="flex flex-1 items-center gap-2 w-full md:max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-muted p-1 px-2 rounded-md border animate-in fade-in slide-in-from-top-1">
            <span className="text-sm font-medium px-2">{selectedIds.length} selected</span>
            <Button variant="ghost" size="sm">
              <Brain className="mr-2 h-4 w-4" />
              Categorize
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border bg-card flex-1 overflow-hidden">
        <TableVirtuoso
          data={filteredExpenses}
          fixedHeaderContent={() => (
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedIds.length === filteredExpenses.length && filteredExpenses.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-32">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right w-32">Amount</TableHead>
              <TableHead className="w-48">Category</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          )}
          itemContent={(_index, expense) => (
            <>
              <TableCell>
                <Checkbox 
                  checked={selectedIds.includes(expense.id)}
                  onCheckedChange={() => toggleSelect(expense.id)}
                />
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {new Date(expense.date).toLocaleDateString()}
              </TableCell>
              <TableCell className="font-medium max-w-md truncate">
                {expense.description}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expense.amount)}
              </TableCell>
              <TableCell>
                <CategoryCell expenseId={expense.id} initialCategory={expense.category} />
              </TableCell>
              <TableCell>
                <Badge variant={
                  expense.status === 'REVIEWED' ? 'success' : 
                  expense.status === 'CATEGORIZED' ? 'default' :
                  'secondary'
                } className="capitalize">
                  {expense.status.toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Match with Receipt</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </>
          )}
          components={{
            Table: (props) => <Table {...props} className="border-collapse" />,
            TableHead: TableHeader,
            TableRow: (props) => <TableRow {...props} className={cn("hover:bg-muted/30", props.className)} />,
            TableBody: TableBody,
          }}
        />
      </div>
    </div>
  )
}
