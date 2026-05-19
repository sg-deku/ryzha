import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./dashboard-client"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { onboardingCompleted: true }
  })

  if (!org?.onboardingCompleted) redirect("/onboarding")

  return <DashboardClient userName={session.user?.name} orgId={session.user?.organizationId} />
}
