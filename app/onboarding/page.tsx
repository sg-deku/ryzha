import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { OnboardingWizard } from "./onboarding-wizard"

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  
  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId }
  })
  
  if (org?.onboardingCompleted) redirect("/dashboard")
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Rhyza</h1>
      <OnboardingWizard />
    </div>
  )
}
