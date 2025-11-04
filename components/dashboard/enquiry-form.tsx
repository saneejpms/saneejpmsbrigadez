"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createEnquiry, updateEnquiry } from "@/app/actions/enquiries"

type Client = {
  id: string
  name: string
  company: string | null
}

type EnquiryFormProps = {
  clients: Client[]
  enquiry?: {
    id: string
    client_id: string | null
    title: string
    description: string | null
    status: string
    priority: string
    estimated_value: number | null
    actual_value: number | null
    start_date: string | null
    end_date: string | null
  }
}

export function EnquiryForm({ clients, enquiry }: EnquiryFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      if (enquiry) {
        await updateEnquiry(enquiry.id, formData)
      } else {
        await createEnquiry(formData)
      }
      router.push("/dashboard/enquiries")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" defaultValue={enquiry?.title} required disabled={isLoading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client_id">Client</Label>
        <Select name="client_id" defaultValue={enquiry?.client_id || "no-client"} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select a client (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-client">No client</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name} {client.company && `(${client.company})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={enquiry?.description || ""}
          disabled={isLoading}
          rows={4}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={enquiry?.status || "pending"} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" defaultValue={enquiry?.priority || "medium"} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="estimated_value">Estimated Value (₹)</Label>
          <Input
            id="estimated_value"
            name="estimated_value"
            type="number"
            step="0.01"
            defaultValue={enquiry?.estimated_value || ""}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="actual_value">Actual Value (₹)</Label>
          <Input
            id="actual_value"
            name="actual_value"
            type="number"
            step="0.01"
            defaultValue={enquiry?.actual_value || ""}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={enquiry?.start_date || ""}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={enquiry?.end_date || ""}
            disabled={isLoading}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : enquiry ? "Update Enquiry" : "Create Enquiry"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
