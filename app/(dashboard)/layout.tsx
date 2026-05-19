"use client"

import { Sidebar } from "@/components/layouts/sidebar"
import { DashboardHeader } from "@/components/layouts/dashboard-header"
import { PageTransition } from "@/components/page-transition"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
