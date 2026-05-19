"use client"

import * as React from "react"
import {
  FileText,
  Receipt,
  BarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  ShieldAlert,
  UserCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SidebarItem } from "./sidebar-item"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Authorized } from "@/components/auth/authorized"

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)

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

  if (!mounted) return null

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "relative hidden h-screen border-r bg-card transition-all duration-300 md:flex flex-col",
          collapsed ? "w-[72px]" : "w-64"
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

        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
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
          
          <div className="pt-4 pb-2 px-3">
            {!collapsed && <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</span>}
            {collapsed && <div className="border-t mx-2" />}
          </div>

          <SidebarItem
            href="/settings/account"
            icon={UserCircle}
            label="Account"
            collapsed={collapsed}
          />

          <Authorized permission="users:manage">
            <SidebarItem
              href="/settings/users"
              icon={Users}
              label="Users"
              collapsed={collapsed}
            />
          </Authorized>

          <Authorized permission="roles:manage">
            <SidebarItem
              href="/settings/roles"
              icon={ShieldAlert}
              label="Roles"
              collapsed={collapsed}
            />
          </Authorized>
        </nav>

        <div className="border-t p-2">
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
