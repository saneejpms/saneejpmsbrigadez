"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Loader2, Trash2, ArrowRight } from "lucide-react"

type Enquiry = {
  id: string
  title: string
  status: string
  priority: string
  estimated_value: number | null
  start_date: string | null
  is_priority?: boolean
  clients: {
    id: string
    name: string
    company: string | null
  } | null
}

interface EnquiriesMobileListProps {
  enquiries: Enquiry[]
  onPriorityToggle: (id: string, currentStatus: boolean) => void
  onDeleteClick: (id: string) => void
  onAddPriority: (id: string) => void
  priorityLoading: boolean
}

export function EnquiriesMobileList({
  enquiries,
  onPriorityToggle,
  onDeleteClick,
  onAddPriority,
  priorityLoading,
}: EnquiriesMobileListProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      completed: "bg-green-500/20 text-green-300 border-green-500/30",
      cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
    }
    return colors[status] || colors.pending
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {enquiries.map((enquiry, idx) => (
        <div key={enquiry.id} className="enquiry-card" style={{ animationDelay: `${idx * 0.05}s` }}>
          {/* Header with title and priority star */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <Link href={`/dashboard/enquiries/${enquiry.id}`} className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                {enquiry.is_priority && (
                  <Star className="h-4 w-4 fill-primary text-primary flex-shrink-0 mt-0.5 animate-glow-pulse" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                    {enquiry.title}
                  </p>
                  {enquiry.clients && (
                    <p className="text-xs text-muted-foreground truncate mt-1">{enquiry.clients.name}</p>
                  )}
                </div>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onPriorityToggle(enquiry.id, !!enquiry.is_priority)
              }}
              disabled={priorityLoading}
              className="h-8 w-8 flex-shrink-0 hover:bg-white/10"
            >
              {priorityLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Star
                  className={`h-4 w-4 transition-colors ${
                    enquiry.is_priority ? "fill-primary text-primary" : "text-muted-foreground"
                  }`}
                />
              )}
            </Button>
          </div>

          {/* Status and priority badges */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <Badge variant="outline" className={`text-xs ${getStatusColor(enquiry.status)}`}>
              {enquiry.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getStatusColor(enquiry.priority)}`}>
              {enquiry.priority}
            </Badge>
          </div>

          {/* Value and date */}
          <div className="text-xs text-muted-foreground space-y-1 mb-3">
            {enquiry.estimated_value && <p>Value: ₹{Number(enquiry.estimated_value).toLocaleString("en-IN")}</p>}
            {enquiry.start_date && <p>Start: {new Date(enquiry.start_date).toLocaleDateString("en-IN")}</p>}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Link href={`/dashboard/enquiries/${enquiry.id}`} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50"
              >
                <ArrowRight className="h-3.5 w-3.5 mr-2" />
                View
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteClick(enquiry.id)}
              className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
