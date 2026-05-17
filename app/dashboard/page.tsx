import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const org = await prisma.organization.findUnique({
    where: { id: (session.user as any).organizationId },
    select: { onboardingCompleted: true }
  })

  if (!org?.onboardingCompleted) redirect("/onboarding")

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Welcome, {session.user?.name}</p>
    </div>
  )
}
