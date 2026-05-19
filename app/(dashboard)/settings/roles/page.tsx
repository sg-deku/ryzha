"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Plus, MoreHorizontal, Settings2, Lock, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

const MOCK_ROLES = [
  { id: "1", name: "Admin", permissions: "Full access (default)", type: "System" },
  { id: "2", name: "Member", permissions: "Create/read own invoices/exp", type: "System" },
  { id: "3", name: "Viewer", permissions: "Read-only access", type: "System" },
  { id: "4", name: "Auditor", permissions: "Read + audit logs access", type: "System" },
  { id: "5", name: "Finance Manager", permissions: "invoices:crud, expenses:crud", type: "Custom" },
]

const PERMISSIONS = [
  { id: "invoices:create", label: "invoices:create" },
  { id: "invoices:read", label: "invoices:read" },
  { id: "invoices:update", label: "invoices:update" },
  { id: "invoices:delete", label: "invoices:delete" },
  { id: "expenses:create", label: "expenses:create" },
  { id: "expenses:read", label: "expenses:read" },
  { id: "expenses:delete", label: "expenses:delete" },
  { id: "reports:view", label: "reports:view" },
  { id: "users:manage", label: "users:manage" },
  { id: "roles:manage", label: "roles:manage" },
  { id: "agent:view_logs", label: "agent:view_logs" },
]

export default function RolesManagementPage() {
  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setTimeout(() => {
      toast.success("Custom role created successfully")
      setIsCreating(false)
      setIsNewRoleOpen(false)
    }, 1500)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">Define custom permissions and access control for your team.</p>
        </div>
        
        <Dialog open={isNewRoleOpen} onOpenChange={setIsNewRoleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create Custom Role</DialogTitle>
              <DialogDescription>
                Define a new set of permissions for your team members.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRole}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input id="role-name" placeholder="e.g. Finance Manager" required />
                </div>
                <div className="grid gap-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-4 border rounded-md p-4 max-h-[300px] overflow-y-auto bg-muted/20">
                    {PERMISSIONS.map((perm) => (
                      <div key={perm.id} className="flex items-center space-x-2">
                        <Checkbox id={perm.id} />
                        <label
                          htmlFor={perm.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {perm.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewRoleOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Role"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Roles</CardTitle>
          <CardDescription>System and custom roles with their associated permissions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="pl-6">Role Name</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ROLES.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="pl-6 font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-md truncate">
                    {role.permissions}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.type === "System" ? "secondary" : "outline"}>
                      {role.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {role.type === "System" ? (
                      <div className="flex justify-end pr-2">
                        <Lock className="h-4 w-4 text-muted-foreground opacity-50" />
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">Role-Based Access Control</h3>
            <p className="text-sm text-primary/80 mt-1">
              Custom roles allow you to fine-tune exactly what each team member can see and do. 
              Upgrade to the Pro plan to create unlimited custom roles.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
