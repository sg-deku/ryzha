import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const org = await prisma.organization.findUnique({
    where: { id: (session.user as any).organizationId },
    select: { onboardingCompleted: true }
  })

  if (org?.onboardingCompleted) {
    redirect("/dashboard")
  } else {
    redirect("/onboarding")
  }
}
