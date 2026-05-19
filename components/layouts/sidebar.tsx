"use client"

import * as React from "react"
import {
  Home,
  FileText,
  Receipt,
  BarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SidebarItem } from "./sidebar-item"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSession } from "next-auth/react"
import { User, Users, Shield, Building } from "lucide-react"

export function Sidebar() {
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) {
      setCollapsed(JSON.parse(saved))
    }
    setMounted(true)
  }, [])

  const toggleCollapse = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState))
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with [ key (common shortcut)
      if (e.key === '[' && (e.metaKey || e.ctrlKey)) {
        toggleCollapse()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [collapsed])

  if (!mounted) return null

  return (
      <TooltipProvider>
        <aside
          className={cn(
            "flex h-screen flex-col border-r bg-background transition-all duration-300",
            collapsed ? "w-16" : "w-64"
          )}
        >
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              R
            </div>
            {!collapsed && <span className="text-xl">Ryzha</span>}
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          <SidebarItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            collapsed={collapsed}
          />
          <SidebarItem
            href="/invoices"
            icon={FileText}
            label="Invoices"
            collapsed={collapsed}
          />
          <SidebarItem
            href="/expenses"
            icon={Receipt}
            label="Expenses"
            collapsed={collapsed}
          />
          <SidebarItem
            href="/reports"
            icon={BarChart}
            label="Reports"
            collapsed={collapsed}
          />
          <SidebarItem
            href="/settings"
            icon={Settings}
            label="Settings"
            collapsed={collapsed}
          />
          <div className={cn("mt-2 space-y-1", !collapsed && "pl-4")}>
            <SidebarItem
              href="/settings/account"
              icon={User}
              label="My Account"
              collapsed={collapsed}
            />
            {session?.user?.role === "ADMIN" && (
              <>
                <SidebarItem
                  href="/settings/users"
                  icon={Users}
                  label="Users"
                  collapsed={collapsed}
                />
                <SidebarItem
                  href="/settings/roles"
                  icon={Shield}
                  label="Roles"
                  collapsed={collapsed}
                />
                <SidebarItem
                  href="/settings/organization"
                  icon={Building}
                  label="Organization"
                  collapsed={collapsed}
                />
              </>
            )}
          </div>
        </nav>

        <div className="border-t p-2 space-y-2">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "px-2 justify-between")}>
            {!collapsed && <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Appearance</span>}
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-full justify-center"
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <div className="flex w-full items-center gap-3 px-1">
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm">Collapse</span>
              </div>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
