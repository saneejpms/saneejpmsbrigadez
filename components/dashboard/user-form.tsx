"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface UserFormProps {
  userId?: string
  initialData?: {
    email: string
    full_name: string
    role: string
  }
}

export function UserForm({ userId, initialData }: UserFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: initialData?.email || "",
    password: "",
    full_name: initialData?.full_name || "",
    role: initialData?.role || "user",
  })

  const isEditMode = !!userId

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = isEditMode ? `/api/users/${userId}` : "/api/users/create"
      const method = isEditMode ? "PUT" : "POST"

      // For edit mode, only send password if it's been changed
      const payload =
        isEditMode && !formData.password
          ? { email: formData.email, full_name: formData.full_name, role: formData.role }
          : formData

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditMode ? "update" : "create"} user`)
      }

      toast({
        title: "Success",
        description: `User ${isEditMode ? "updated" : "created"} successfully`,
      })

      router.push("/dashboard/users")
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${isEditMode ? "update" : "create"} user`
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          disabled={isLoading}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password {!isEditMode && "*"}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required={!isEditMode}
          disabled={isLoading}
          minLength={6}
          placeholder={isEditMode ? "Leave blank to keep current password" : ""}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        {isEditMode && <p className="text-xs text-muted-foreground">Leave blank to keep the current password</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          required
          disabled={isLoading}
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role" value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="estimator">Estimator</SelectItem>
            <SelectItem value="designer">Designer</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update User" : "Create User"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
