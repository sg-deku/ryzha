"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const financialSettingsSchema = z.object({
  baseCurrency: z.string().min(1),
  fiscalYearStart: z.string().min(1),
  bankBalance: z.number().min(0),
  averageMonthlyExpenses: z.number().nullable(),
  deferredRevenueRules: z.array(z.string()),
  deferralPeriodMonths: z.number().min(1),
  contractVerificationSource: z.string(),
  requireAuditSeal: z.boolean(),
  autoRejectUnverified: z.boolean(),
  targetMonthlyRevenue: z.number().min(0),
  lowRunwayAlertThreshold: z.number().min(1),
  enableVoiceSummary: z.boolean(),
  elevenLabsVoiceId: z.string(),
  voiceScriptTemplate: z.string(),
  enableSMS: z.boolean(),
  smsRecipientNumber: z.string().nullable(),
  aiProvider: z.string().nullable(),
  aiModel: z.string().min(1),
  aiApiKey: z.string().nullable(),
  expenseCategories: z.any().optional(),
})

type FinancialSettingsValues = z.infer<typeof financialSettingsSchema>

export default function FinancialEngineClient({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categoriesStr, setCategoriesStr] = useState(() => {
    try {
      const cats = initialData?.expenseCategories;
      if (Array.isArray(cats)) return cats.join(", ");
      if (typeof cats === "string") {
        const parsed = JSON.parse(cats);
        if (Array.isArray(parsed)) return parsed.join(", ");
      }
      return "Software, Hardware, Office Supplies, Travel, Meals, Legal, Marketing, Other";
    } catch {
      return "Software, Hardware, Office Supplies, Travel, Meals, Legal, Marketing, Other";
    }
  });

  const form = useForm<FinancialSettingsValues>({
    resolver: zodResolver(financialSettingsSchema),
    defaultValues: initialData || {
      baseCurrency: "USD",
      fiscalYearStart: "January",
      bankBalance: 0,
      averageMonthlyExpenses: 0,
      deferredRevenueRules: ["annual"],
      deferralPeriodMonths: 12,
      contractVerificationSource: "manual",
      requireAuditSeal: true,
      autoRejectUnverified: false,
      targetMonthlyRevenue: 10000,
      lowRunwayAlertThreshold: 3,
      enableVoiceSummary: true,
      elevenLabsVoiceId: "21m00Tcm4TlvDq8ikWAM",
      voiceScriptTemplate: "Karina, a {{amount}} credit has been reconciled under ASC 606. This improves our net income for the quarter and extends our cash runway by {{runwayDays}} days, moving our 'Zero Cash Date' to {{zeroCashDate}}. We are currently {{percentAhead}}% ahead of our financial plan.",
      enableSMS: false,
      smsRecipientNumber: "",
      aiProvider: "openai",
      aiModel: "gpt-4o-mini",
      aiApiKey: "",
    },
  })

  async function onSubmit(data: FinancialSettingsValues) {
    setIsLoading(true)
    try {
      const parsedCategories = categoriesStr.split(",").map(c => c.trim()).filter(Boolean)
      const payload = {
        ...data,
        expenseCategories: parsedCategories
      }
      const response = await fetch("/api/settings/financial", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to update settings")

      toast.success("Financial engine settings updated successfully")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Financial Engine Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure how the AI agents process and analyze your financial data.
        </p>
      </div>
      <Separator />
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="ai">AI Config</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="fpa">FP&A</TabsTrigger>
            <TabsTrigger value="voice-sms">Voice & SMS</TabsTrigger>
            <TabsTrigger value="p2p">P2P</TabsTrigger>
            <TabsTrigger value="o2c">O2C</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic financial configuration for your organization.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseCurrency">Base Currency</Label>
                    <Input {...form.register("baseCurrency")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiscalYearStart">Fiscal Year Start</Label>
                    <Select 
                      onValueChange={(value) => form.setValue("fiscalYearStart", value)}
                      defaultValue={form.getValues("fiscalYearStart")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankBalance">Current Bank Balance</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...form.register("bankBalance", { valueAsNumber: true })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="averageMonthlyExpenses">Avg. Monthly Expenses</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...form.register("averageMonthlyExpenses", { valueAsNumber: true })} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expenseCategories">Expense Categories (comma separated)</Label>
                  <textarea 
                    id="expenseCategories"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={categoriesStr}
                    onChange={(e) => setCategoriesStr(e.target.value)}
                    placeholder="Software, Hardware, Travel, Meals..."
                  />
                  <p className="text-xs text-muted-foreground">Categories used by AI and for manual entry.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Configuration</CardTitle>
                <CardDescription>
                  Configure the AI model and API key used by the agents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aiProvider">AI Provider</Label>
                  <Select 
                    value={form.watch("aiProvider") || "openai"} 
                    onValueChange={(val) => form.setValue("aiProvider", val, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aiModel">AI Model</Label>
                  <Input 
                    id="aiModel" 
                    {...form.register("aiModel")} 
                    placeholder="e.g., gpt-4o, claude-3-5-sonnet-20240620, gemini-1.5-pro"
                  />
                  <p className="text-xs text-muted-foreground">
                    Specify the exact model string for the selected provider.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aiApiKey">API Key</Label>
                  <Input 
                    id="aiApiKey" 
                    type="password"
                    {...form.register("aiApiKey")} 
                    placeholder="Enter your API key (leave blank to use system default)"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Recognition Rules</CardTitle>
                <CardDescription>Configure how R2R and O&M agents handle revenue recognition (ASC 606).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deferralPeriodMonths">Default Deferral Period (Months)</Label>
                  <Input 
                    type="number" 
                    {...form.register("deferralPeriodMonths", { valueAsNumber: true })} 
                  />
                  <p className="text-xs text-muted-foreground">Standard period for spreading deferred revenue.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit & Compliance Rules</CardTitle>
                <CardDescription>Settings for the Auditor agent and verification workflows.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Require Audit Seal</Label>
                    <p className="text-sm text-muted-foreground">Ensure every transaction is verified against a contract.</p>
                  </div>
                  <Switch 
                    checked={form.watch("requireAuditSeal")}
                    onCheckedChange={(checked) => form.setValue("requireAuditSeal", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Auto-Reject Unverified</Label>
                    <p className="text-sm text-muted-foreground">Automatically flag transactions that fail verification.</p>
                  </div>
                  <Switch 
                    checked={form.watch("autoRejectUnverified")}
                    onCheckedChange={(checked) => form.setValue("autoRejectUnverified", checked)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Contract Verification Source</Label>
                  <Select 
                    onValueChange={(value) => form.setValue("contractVerificationSource", value)}
                    defaultValue={form.getValues("contractVerificationSource")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Upload</SelectItem>
                      <SelectItem value="stripe">Stripe Products</SelectItem>
                      <SelectItem value="hubspot">HubSpot (Mock)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fpa" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Forecasting & Planning (FP&A)</CardTitle>
                <CardDescription>Configure parameters for the FP&A agent's runway calculations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetMonthlyRevenue">Target Monthly Revenue</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...form.register("targetMonthlyRevenue", { valueAsNumber: true })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowRunwayAlertThreshold">Low Runway Alert (Months)</Label>
                    <Input 
                      type="number" 
                      {...form.register("lowRunwayAlertThreshold", { valueAsNumber: true })} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice-sms" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Voice & SMS Notifications</CardTitle>
                <CardDescription>Configure ElevenLabs and Twilio output for agent summaries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Enable Voice Summary</Label>
                    <p className="text-sm text-muted-foreground">Generate audio briefings after significant transactions.</p>
                  </div>
                  <Switch 
                    checked={form.watch("enableVoiceSummary")}
                    onCheckedChange={(checked) => form.setValue("enableVoiceSummary", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elevenLabsVoiceId">ElevenLabs Voice ID</Label>
                  <Input {...form.register("elevenLabsVoiceId")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voiceScriptTemplate">Voice Script Template</Label>
                  <textarea 
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register("voiceScriptTemplate")} 
                  />
                  <p className="text-xs text-muted-foreground">Use placeholders: {"{{amount}}, {{runwayDays}}, {{zeroCashDate}}, {{percentAhead}}"}</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Enable SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send brief summaries via Twilio.</p>
                  </div>
                  <Switch 
                    checked={form.watch("enableSMS")}
                    onCheckedChange={(checked) => form.setValue("enableSMS", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smsRecipientNumber">SMS Recipient Number</Label>
                  <Input placeholder="+1234567890" {...form.register("smsRecipientNumber")} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="p2p" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Approval Workflow</CardTitle>
                <CardDescription>Configure how purchase orders and invoices are approved.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Approve Low Value POs</Label>
                    <p className="text-sm text-muted-foreground">POs below the threshold will be approved automatically.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5 pt-2">
                  <Label htmlFor="limit">Auto-Approve Limit ($)</Label>
                  <Input type="number" id="limit" defaultValue="500" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Three-Way Matching</Label>
                    <p className="text-sm text-muted-foreground">Require invoice to match both PO and Receiving records.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Early Payment Discounts</CardTitle>
                <CardDescription>Optimize cash flow by capturing vendor discounts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alert on Discount Opportunities</Label>
                    <p className="text-sm text-muted-foreground">Notify when early payment would result in significant savings.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="o2c" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Credit Management</CardTitle>
                <CardDescription>Manage customer risk and credit availability.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="credit">Default Credit Limit ($)</Label>
                  <Input type="number" id="credit" defaultValue="5000" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Hold Orders</Label>
                    <p className="text-sm text-muted-foreground">Place orders on hold if customer is over their credit limit.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collections & Dunning</CardTitle>
                <CardDescription>Configure automated payment reminders.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Automated Dunning</Label>
                    <p className="text-sm text-muted-foreground">Automatically send reminders for past-due invoices.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5 pt-2">
                  <Label htmlFor="frequency">First Reminder (Days After Due)</Label>
                  <Input type="number" id="frequency" defaultValue="3" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
