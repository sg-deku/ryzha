"use client"
import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, SquareSquare } from "lucide-react"
import { toast } from "sonner"

export function LiveExecutionView({ executionId }: { executionId: string | null }) {
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "error">("idle")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!executionId) return

    setLogs([`Connecting to execution stream for ${executionId}...`])
    setStatus("running")

    const eventSource = new EventSource(`/api/webhooks/logs?transactionId=${executionId}`)
    
    eventSource.onmessage = (event) => {
      setLogs((prev) => [...prev, event.data])
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }
    
    eventSource.addEventListener("end", () => {
      setStatus("completed")
      eventSource.close()
    })

    eventSource.onerror = () => {
      // Don't mark as error if it just closed normally
      if (status === "running") {
         setLogs((prev) => [...prev, "Connection lost or closed."])
      }
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [executionId])

  const handleStop = async () => {
    if (!executionId) return
    try {
      const res = await fetch("/api/workflow-studio/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executionId })
      })
      if (res.ok) {
        toast.success("Workflow stopped")
        setStatus("error")
      } else {
        toast.error("Failed to stop workflow")
      }
    } catch (e) {
      toast.error("Failed to stop workflow")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Live Execution</CardTitle>
          <CardDescription>
            {executionId ? `Execution ID: ${executionId}` : "No active execution. Trigger a workflow first."}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          {status === "running" && <Badge variant="secondary" className="animate-pulse"><Loader2 className="mr-1 h-3 w-3 animate-spin"/> Running</Badge>}
          {status === "completed" && <Badge className="bg-green-500">Completed</Badge>}
          {status === "error" && <Badge variant="destructive">Stopped/Error</Badge>}
          
          <Button variant="destructive" size="sm" disabled={status !== "running" || !executionId} onClick={handleStop}>
            <SquareSquare className="mr-2 h-4 w-4" /> Stop
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={scrollRef}
          className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-[400px] overflow-y-auto whitespace-pre-wrap"
        >
          {logs.length === 0 ? (
            <span className="text-gray-500">Waiting for logs...</span>
          ) : (
            logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
