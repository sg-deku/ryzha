import { prisma } from "@/lib/prisma"

export async function runFPAgent(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { organization: true }
  })
  if (!transaction) return null

  // Calculate bank balance: sum of all paid invoices + all transactions - expenses
  const [invoicesTotal, expensesTotal, transactionsTotal] = await Promise.all([
    prisma.invoice.aggregate({ 
      where: { organizationId: transaction.organizationId, status: "PAID" }, 
      _sum: { total: true } 
    }),
    prisma.expense.aggregate({ 
      where: { organizationId: transaction.organizationId }, 
      _sum: { amount: true } 
    }),
    prisma.transaction.aggregate({ 
      where: { organizationId: transaction.organizationId }, 
      _sum: { amount: true } 
    })
  ])

  const totalRevenue = (invoicesTotal._sum.total || 0) + (transactionsTotal._sum.amount || 0)
  const totalExpenses = expensesTotal._sum.amount || 0
  const bankBalance = totalRevenue - totalExpenses

  // Average monthly expenses over last 3 months
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const recentExpenses = await prisma.expense.aggregate({
    where: { 
      organizationId: transaction.organizationId, 
      date: { gte: threeMonthsAgo } 
    },
    _sum: { amount: true }
  })
  const avgMonthlyExpenses = (recentExpenses._sum.amount || 0) / 3

  const runwayMonths = avgMonthlyExpenses > 0 ? bankBalance / avgMonthlyExpenses : 999
  const zeroCashDate = new Date()
  zeroCashDate.setDate(zeroCashDate.getDate() + Math.round(runwayMonths * 30))

  // Percent ahead of plan (mock plan: user can set monthly target; default $10k)
  const targetMonthlyRevenue = 10000
  const actualMonthlyRevenue = (transactionsTotal._sum.amount || 0) / 3 // crude average
  const percentAhead = ((actualMonthlyRevenue - targetMonthlyRevenue) / targetMonthlyRevenue) * 100

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      runwayMonths,
      zeroCashDate,
      percentAhead,
      agentLogs: {
        push: {
          agent: "FP&A",
          message: `Runway recalculated: ${runwayMonths.toFixed(1)} months. Zero cash date: ${zeroCashDate.toLocaleDateString()}. ${percentAhead > 0 ? `+${percentAhead.toFixed(0)}%` : `${percentAhead.toFixed(0)}%`} ahead of plan.`,
          timestamp: new Date()
        }
      }
    }
  })

  // Update global financial snapshot
  await prisma.financialSnapshot.upsert({
    where: { organizationId: transaction.organizationId },
    update: { 
      bankBalance, 
      averageMonthlyExpenses: avgMonthlyExpenses, 
      runwayMonths, 
      zeroCashDate 
    },
    create: { 
      organizationId: transaction.organizationId, 
      bankBalance, 
      averageMonthlyExpenses: avgMonthlyExpenses, 
      runwayMonths, 
      zeroCashDate 
    }
  })

  return updated
}
