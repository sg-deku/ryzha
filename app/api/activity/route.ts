import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json([
    {
      id: "1",
      type: "invoice",
      description: "Invoice #INV-001 created",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
      link: "/invoices"
    },
    {
      id: "2",
      type: "expense",
      description: "AWS Web Services expense auto-categorized",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      link: "/expenses"
    },
    {
      id: "3",
      type: "payment",
      description: "Payment received for #INV-002",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      link: "/invoices"
    },
    {
      id: "4",
      type: "expense",
      description: "Uber ride expense added",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      link: "/expenses"
    },
    {
      id: "5",
      type: "alert",
      description: "Unusual expense anomaly detected",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      link: "/dashboard"
    }
  ])
}