import { prisma } from "@/lib/prisma"

export async function buildTaxReport(orgId: string, startDate: Date, endDate: Date) {
  const invoices = await prisma.invoice.findMany({
    where: { 
      organizationId: orgId, 
      issueDate: { gte: startDate, lte: endDate },
      status: { in: ["PAID", "SENT"] } // Include SENT for accrual basis, or just PAID as per user snippet
    },
    include: { lineItems: true }
  })

  let outputTax = 0
  const invoiceDetails = invoices.map(inv => {
    outputTax += inv.totalTax
    return {
      date: inv.issueDate,
      reference: inv.invoiceNumber,
      type: "INVOICE",
      amount: inv.total,
      tax: inv.totalTax
    }
  })

  const expenses = await prisma.expense.findMany({
    where: { 
      organizationId: orgId, 
      date: { gte: startDate, lte: endDate }, 
      taxRelevant: true 
    }
  })

  // Using a simplified 20% for input tax as per user request, 
  // but in reality this would depend on the expense category and rule
  let inputTax = 0
  const expenseDetails = expenses.map(e => {
    const tax = e.amount * 0.2 
    inputTax += tax
    return {
      date: e.date,
      reference: e.description,
      type: "EXPENSE",
      amount: e.amount,
      tax: tax
    }
  })

  return { 
    outputTax, 
    inputTax, 
    netOwed: outputTax - inputTax,
    details: [...invoiceDetails, ...expenseDetails].sort((a, b) => b.date.getTime() - a.date.getTime())
  }
}
