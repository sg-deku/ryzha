import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, PieChart, TrendingUp, Landmark, ArrowRight } from "lucide-react"

export default function ReportsPage() {
  const reports = [
    {
      title: "Tax Report",
      description: "Detailed breakdown of sales tax collected and deductible expenses.",
      href: "/reports/tax",
      icon: Landmark,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Cash Flow",
      description: "Analyze your income and expenses over time to understand liquidity.",
      href: "#",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      status: "Coming Soon"
    },
    {
      title: "Expense Categories",
      description: "Distribution of spending across different business categories.",
      href: "#",
      icon: PieChart,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      status: "Coming Soon"
    },
    {
      title: "Financial Digest",
      description: "Monthly summary of organization-wide financial performance.",
      href: "#",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      status: "Coming Soon"
    }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Access and export your financial data and compliance reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.title} className="group hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className={`p-3 rounded-xl ${report.bgColor} ${report.color}`}>
                <report.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{report.title}</CardTitle>
                  {report.status && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-muted px-2 py-1 rounded text-muted-foreground">
                      {report.status}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-1">{report.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant={report.status ? "outline" : "default"} 
                className="w-full" 
                asChild={!report.status}
                disabled={!!report.status}
              >
                {report.status ? (
                  "Unavailable"
                ) : (
                  <Link href={report.href} className="flex items-center justify-center w-full">
                    View Report
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
