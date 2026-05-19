import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Mocking history for now, ideally fetch from Transaction/VendorInvoice/SalesOrder
  const mockHistory = [
    { id: "sim_tx_12345", type: "stripe", startedAt: new Date(Date.now() - 3600000).toISOString(), status: "COMPLETED" },
    { id: "sim_p2p_67890", type: "p2p", startedAt: new Date(Date.now() - 86400000).toISOString(), status: "ERROR" }
  ]

  return NextResponse.json(mockHistory)
}
