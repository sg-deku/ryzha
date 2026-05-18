"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  // Sidebar implementation will be in UI-2.1
  // For now, we just provide the responsive container
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 transition-all duration-300 ease-in-out">
        <div className="container px-4 md:px-8 py-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
