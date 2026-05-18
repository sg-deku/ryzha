import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AICategorizeButton } from "@/components/expenses/ai-categorize-button"
import { CategoryCell } from "@/components/expenses/category-cell"

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const expenses = await prisma.expense.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { date: "desc" }
  })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Link 
          href="/expenses/upload" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload CSV
        </Link>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Description</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Amount</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Category</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No expenses found. Upload a CSV to get started.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expense.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <CategoryCell expenseId={expense.id} initialCategory={expense.category} />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                        expense.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        expense.status === 'CATEGORIZED' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {expense.status}
                      </span>
                      {expense.status === 'REVIEWED' && (
                        <span className="text-[10px] text-orange-600 font-medium italic">
                          Requires manual review
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {expense.status === 'PENDING' && (
                      <AICategorizeButton expenseId={expense.id} />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
