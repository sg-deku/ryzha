import { NextResponse } from "next/server"

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json([
    {
      title: "MRR",
      value: "$12,450",
      change: "+12.5%",
      data: [10000, 10500, 11000, 11200, 11500, 12000, 12450]
    },
    {
      title: "Cash Balance",
      value: "$45,231",
      change: "+5.2%",
      data: [42000, 43000, 41500, 42200, 44000, 44800, 45231]
    },
    {
      title: "Outstanding Invoices",
      value: "$8,200",
      change: "-2.4%",
      data: [9000, 8800, 8500, 8600, 8400, 8300, 8200]
    },
    {
      title: "Expenses This Month",
      value: "$3,120",
      change: "+1.2%",
      data: [500, 1000, 1200, 1800, 2200, 2800, 3120]
    },
    {
      title: "Runway",
      value: "14.2 mo",
      change: "+0.5 mo",
      data: [12.1, 12.5, 12.8, 13.0, 13.5, 13.8, 14.2]
    },
    {
      title: "Burn Rate",
      value: "$3,180/mo",
      change: "-5.4%",
      data: [3500, 3450, 3400, 3350, 3300, 3200, 3180]
    },
    {
      title: "Churn Rate",
      value: "1.2%",
      change: "-0.2%",
      data: [2.1, 1.9, 1.8, 1.6, 1.5, 1.4, 1.2]
    }
  ])
}