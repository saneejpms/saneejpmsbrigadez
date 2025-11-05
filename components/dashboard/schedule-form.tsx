"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type Enquiry = {
  id: string
  title: string
}

type ScheduleFormProps = {
  enquiries: Enquiry[]
  schedule?: {
    id: string
    enquiry_id: string | null
    title: string
    description: string | null
    start_date: string
    end_date: string
    status: string
    priority: string
    notes: string | null
  }
}

export function ScheduleForm({ enquiries, schedule }: ScheduleFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const data = {
      enquiry_id: formData.get("enquiry_id"),
      title: formData.get("title"),
      description: formData.get("description"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      status: formData.get("status"),
      priority: formData.get("priority"),
      notes: formData.get("notes"),
    }

    try {
      const url = schedule ? `/api/schedules/${schedule.id}` : "/api/schedules/create"
      const method = schedule ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save schedule")
      }

      toast({
        title: "Success",
        description: schedule ? "Schedule updated successfully" : "Schedule created successfully",
      })

      router.push("/dashboard/schedules")
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" defaultValue={schedule?.title} required disabled={isLoading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="enquiry_id">Linked Enquiry</Label>
        <Select name="enquiry_id" defaultValue={schedule?.enquiry_id || "no-enquiry"} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select an enquiry (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-enquiry">No enquiry</SelectItem>
            {enquiries.map((enquiry) => (
              <SelectItem key={enquiry.id} value={enquiry.id}>
                {enquiry.title}
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
          defaultValue={schedule?.description || ""}
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date & Time *</Label>
          <Input
            id="start_date"
            name="start_date"
            type="datetime-local"
            defaultValue={schedule?.start_date ? new Date(schedule.start_date).toISOString().slice(0, 16) : ""}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date & Time *</Label>
          <Input
            id="end_date"
            name="end_date"
            type="datetime-local"
            defaultValue={schedule?.end_date ? new Date(schedule.end_date).toISOString().slice(0, 16) : ""}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select name="status" defaultValue={schedule?.status || "scheduled"} required disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select name="priority" defaultValue={schedule?.priority || "medium"} required disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
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

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={schedule?.notes || ""} disabled={isLoading} rows={3} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : schedule ? "Update Schedule" : "Create Schedule"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
