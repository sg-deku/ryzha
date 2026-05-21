export const dynamic = "force-dynamic"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { StandardReports } from "./components/standard-reports"
import { AIAssistant } from "./components/ai-assistant"
import { PLReportClient } from "./profit-loss/pl-report-client"

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">Financial insights and AI-powered questions</p>
      </div>

      <Tabs defaultValue="standard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="standard">Standard Reports</TabsTrigger>
          <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant (Ask Ryzha)</TabsTrigger>
        </TabsList>
        <TabsContent value="standard">
          <StandardReports />
        </TabsContent>
        <TabsContent value="pl">
          <PLReportClient />
        </TabsContent>
        <TabsContent value="ai">
          <AIAssistant />
        </TabsContent>
      </Tabs>
    </div>
  )
}
