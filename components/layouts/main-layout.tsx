"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { PageTransition } from "../page-transition"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="container px-4 md:px-8 py-6 max-w-7xl mx-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
