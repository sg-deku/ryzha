import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  // Basic check for admin role
  if (session?.user?.role !== 'ADMIN') {
    // Also allow access if they have specific permissions
    // In a real scenario you would check specific permissions like "org:manage"
    // Since we don't have the exact permissions hook here, checking role is standard
    redirect('/dashboard')
  }

  return <>{children}</>
}
