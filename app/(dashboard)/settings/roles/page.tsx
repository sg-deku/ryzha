"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Shield, Trash2, Edit } from "lucide-react"

export const dynamic = "force-dynamic"

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [roleOpen, setRoleOpen] = useState(false)
  const [roleData, setRoleData] = useState({
    name: "",
    description: "",
    permissionIds: [] as string[]
  })

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch("/api/roles"),
        fetch("/api/permissions")
      ])
      
      if (!rolesRes.ok || !permsRes.ok) throw new Error("Failed to fetch data")
      
      const rolesData = await rolesRes.json()
      const permsData = await permsRes.json()
      
      setRoles(rolesData)
      setPermissions(permsData)
    } catch (error) {
      toast.error("Failed to load roles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData)
      })
      
      if (!response.ok) throw new Error("Failed to create role")
      
      toast.success("Role created successfully")
      setRoleOpen(false)
      setRoleData({ name: "", description: "", permissionIds: [] })
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return
    
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE"
      })
      
      if (!response.ok) {
        const d = await response.json()
        throw new Error(d.error || "Failed to delete role")
      }
      
      toast.success("Role deleted")
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const togglePermission = (permId: string) => {
    setRoleData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permId)
        ? prev.permissionIds.filter(id => id !== permId)
        : [...prev.permissionIds, permId]
    }))
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">
            Manage permissions and roles for your organization.
          </p>
        </div>
        <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a custom role with specific permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input 
                    id="name" 
                    value={roleData.name}
                    onChange={(e) => setRoleData({ ...roleData, name: e.target.value })}
                    placeholder="Finance Manager" 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    value={roleData.description}
                    onChange={(e) => setRoleData({ ...roleData, description: e.target.value })}
                    placeholder="Full access to invoices and reports" 
                  />
                </div>
                
                <div className="space-y-4">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-4 border rounded-md p-4 max-h-[200px] overflow-y-auto">
                    {permissions.map((perm) => (
                      <div key={perm.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`perm-${perm.id}`} 
                          checked={roleData.permissionIds.includes(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                        />
                        <label 
                          htmlFor={`perm-${perm.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {perm.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Role</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Loading roles...
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.description || "No description provided"}
                  </TableCell>
                  <TableCell>
                    {role.isSystem ? (
                      <Badge variant="secondary">System</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!role.isSystem && (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => handleDelete(role.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
