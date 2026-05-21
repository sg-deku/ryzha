"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"
import { WidgetConfig, DEFAULT_WIDGET_CONFIG } from "@/lib/dashboard/widget-config"
import { DashboardLayoutEditor } from "./components/DashboardLayoutEditor"
import { KpiRowWidget } from "./components/widgets/KpiRowWidget"
import { AlertsRowWidget } from "./components/widgets/AlertsRowWidget"
import { CashFlowWidget } from "./components/widgets/CashFlowWidget"
import { AgentLogWidget } from "./components/widgets/AgentLogWidget"
import { AnomalyAlertsWidget } from "./components/widgets/AnomalyAlertsWidget"
import { RecentTransactionsWidget } from "./components/widgets/RecentTransactionsWidget"
import { RealTimePLWidget } from "./components/widgets/RealTimePLWidget"

interface DashboardClientProps {
  userName: string | null | undefined
  orgId: string | undefined
  pendingPurchases?: number
  overdueSales?: number
}

function renderWidget(
  widget: WidgetConfig,
  props: { pendingPurchases: number; overdueSales: number },
  onSettingsChange: (id: string, settings: Record<string, any>) => void
) {
  switch (widget.id) {
    case "kpi_row":
      return <KpiRowWidget key={widget.id} />
    case "alerts_row":
      return (
        <AlertsRowWidget
          key={widget.id}
          pendingPurchases={props.pendingPurchases}
          overdueSales={props.overdueSales}
        />
      )
    case "real_time_pl":
      return (
        <RealTimePLWidget
          key={widget.id}
          settings={widget.settings}
          onSettingsChange={(s) => onSettingsChange(widget.id, s)}
        />
      )
    case "cash_flow":
      return <CashFlowWidget key={widget.id} />
    case "agent_log":
      return <AgentLogWidget key={widget.id} />
    case "anomaly_alerts":
      return <AnomalyAlertsWidget key={widget.id} />
    case "recent_transactions":
      return <RecentTransactionsWidget key={widget.id} />
    default:
      return null
  }
}

const PAIRED_WIDGETS = new Set(["cash_flow", "agent_log", "anomaly_alerts", "recent_transactions"])

export function DashboardClient({
  userName,
  orgId,
  pendingPurchases = 0,
  overdueSales = 0,
}: DashboardClientProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGET_CONFIG)
  const [editorOpen, setEditorOpen] = useState(false)
  const [layoutLoaded, setLayoutLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/dashboard/layout")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.widgets) setWidgets(data.widgets)
      })
      .catch(() => {})
      .finally(() => setLayoutLoaded(true))
  }, [])

  const handleSaveLayout = async (newWidgets: WidgetConfig[]) => {
    const res = await fetch("/api/dashboard/layout", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widgets: newWidgets }),
    })
    if (res.ok) {
      const data = await res.json()
      setWidgets(data.widgets)
    }
  }

  const handleSettingsChange = useCallback((id: string, settings: Record<string, any>) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, settings: { ...w.settings, ...settings } } : w))
    )
    fetch("/api/dashboard/layout", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        widgets: widgets.map((w) =>
          w.id === id ? { ...w, settings: { ...w.settings, ...settings } } : w
        ),
      }),
    }).catch(() => {})
  }, [widgets])

  const visible = [...widgets]
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order)

  const pairedGroups: WidgetConfig[][] = []
  const standalone: WidgetConfig[] = []
  let pairBuffer: WidgetConfig[] = []

  for (const w of visible) {
    if (PAIRED_WIDGETS.has(w.id)) {
      pairBuffer.push(w)
      if (pairBuffer.length === 2) {
        pairedGroups.push([...pairBuffer])
        pairBuffer = []
      }
    } else {
      if (pairBuffer.length > 0) {
        pairedGroups.push([...pairBuffer])
        pairBuffer = []
      }
      standalone.push(w)
    }
  }
  if (pairBuffer.length > 0) pairedGroups.push([...pairBuffer])

  const rendered: React.ReactNode[] = []
  let pairGroupIdx = 0

  for (const w of visible) {
    if (PAIRED_WIDGETS.has(w.id)) {
      const group = pairedGroups[pairGroupIdx]
      if (group && group[0].id === w.id) {
        rendered.push(
          <div key={`pair-${pairGroupIdx}`} className="grid gap-6 lg:grid-cols-2">
            {group.map((gw) =>
              renderWidget(gw, { pendingPurchases, overdueSales }, handleSettingsChange)
            )}
          </div>
        )
        pairGroupIdx++
        if (group.length === 2) {
          const secondId = group[1].id
          const secondIdx = visible.findIndex((v) => v.id === secondId)
          if (secondIdx > -1) visible.splice(secondIdx, 1)
        }
      }
    } else {
      rendered.push(renderWidget(w, { pendingPurchases, overdueSales }, handleSettingsChange))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {userName ? `Welcome, ${userName.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-muted-foreground text-sm">Your financial overview at a glance</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setEditorOpen(true)}
        >
          <Settings2 className="h-4 w-4" />
          Customize
        </Button>
      </div>

      {layoutLoaded ? (
        rendered
      ) : (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 w-full rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      <DashboardLayoutEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        widgets={widgets}
        onSave={handleSaveLayout}
      />
    </div>
  )
}
