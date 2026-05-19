"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Users, Shield, Building, Globe, Bell, CreditCard, Brain } from "lucide-react"
import Link from "next/link"

const SETTINGS_GROUPS = [
  {
    title: "Personal",
    description: "Manage your personal profile and preferences",
    items: [
      {
        title: "My Account",
        description: "Profile information, email, and password",
        icon: User,
        href: "/settings/account",
      },
      {
        title: "Notifications",
        description: "How you want to be alerted",
        icon: Bell,
        href: "/settings/notifications",
      },
    ],
  },
  {
    title: "Organization",
    description: "Manage your company settings and team",
    items: [
      {
        title: "Profile",
        description: "Company details and legal identity",
        icon: Building,
        href: "/settings/organization",
      },
      {
        title: "Team Members",
        description: "Manage users and their roles",
        icon: Users,
        href: "/settings/users",
      },
      {
        title: "Roles & Permissions",
        description: "Define access control levels",
        icon: Shield,
        href: "/settings/roles",
      },
      {
        title: "Financial Engine",
        description: "AI agent behavior and revenue rules",
        icon: Brain,
        href: "/settings/financial-engine",
      },
      {
        title: "Billing",
        description: "Manage subscriptions and payment methods",
        icon: CreditCard,
        href: "/settings/billing",
      },
    ],
  },
  {
    title: "System",
    description: "Technical configuration and data",
    items: [
      {
        title: "Integrations",
        description: "Connect Stripe, bank accounts, and more",
        icon: Globe,
        href: "/settings/integrations",
      },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and organization settings.</p>
      </div>

      <div className="space-y-8">
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.title} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <Link key={item.title} href={item.href}>
                  <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-muted/60 shadow-none">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{item.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
