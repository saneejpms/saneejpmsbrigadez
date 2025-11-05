"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Sparkles } from "lucide-react"

type Client = {
  id: string
  name: string
  company: string | null
}

type CreateEnquiryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
}

export function CreateEnquiryModal({ open, onOpenChange, clients }: CreateEnquiryModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: "none", // Updated default value to be a non-empty string
    title: "",
    description: "",
    due_date: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/enquiries/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: formData.client_id === "none" ? null : formData.client_id,
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create enquiry")
      }

      toast({
        title: "Enquiry created",
        description: `${data.enquiry_code} has been created successfully.`,
      })

      // Reset form
      setFormData({ client_id: "none", title: "", description: "", due_date: "" }) // Updated default value to be a non-empty string
      onOpenChange(false)

      // Refresh the page to show new enquiry
      router.refresh()
    } catch (error) {
      console.error("[v0] Create enquiry error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create enquiry",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-card animate-scale-in border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create New Enquiry
          </DialogTitle>
          <DialogDescription>Add a new project enquiry to your system.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <Label htmlFor="title">Job Name *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Office Renovation"
              required
              disabled={isLoading}
              className="glass-card border-primary/20 focus:glow-primary transition-all"
            />
          </div>

          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Label htmlFor="client_id">Client</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              disabled={isLoading}
            >
              <SelectTrigger className="glass-card border-primary/20 focus:glow-primary transition-all">
                <SelectValue placeholder="Select a client (optional)" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="none">No client</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} {client.company && `(${client.company})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the project..."
              rows={3}
              disabled={isLoading}
              className="glass-card border-primary/20 focus:glow-primary transition-all resize-none"
            />
          </div>

          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              disabled={isLoading}
              className="glass-card border-primary/20 focus:glow-primary transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="glass-card hover:bg-secondary/50 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 glow-primary transition-all"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Enquiry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
