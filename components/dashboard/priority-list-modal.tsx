"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GripVertical, ExternalLink, X, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface PriorityEnquiry {
  id: string
  code: string
  job_name: string
  client_name: string
  stage: string
  due_date: string | null
  priority_rank: number
}

interface PriorityListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SortableRow({
  enquiry,
  onRemove,
  onOpen,
}: {
  enquiry: PriorityEnquiry
  onRemove: (id: string) => void
  onOpen: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: enquiry.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getStageColor = (stage: string) => {
    const stageColors: Record<string, string> = {
      new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      in_progress: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      on_hold: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }
    return stageColors[stage] || "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
        <div className="font-mono text-sm font-semibold">{enquiry.code}</div>
        <div className="md:col-span-2 font-medium">{enquiry.job_name}</div>
        <div className="text-sm text-muted-foreground">{enquiry.client_name}</div>
        <div className="flex items-center gap-2">
          <Badge className={getStageColor(enquiry.stage)} variant="outline">
            {enquiry.stage.replace("_", " ")}
          </Badge>
          {enquiry.due_date && (
            <span className="text-xs text-muted-foreground">{new Date(enquiry.due_date).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={() => onOpen(enquiry.id)}>
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onRemove(enquiry.id)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function PriorityListModal({ open, onOpenChange }: PriorityListModalProps) {
  const router = useRouter()
  const [enquiries, setEnquiries] = useState<PriorityEnquiry[]>([])
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    if (open) {
      fetchPriorityEnquiries()
    }
  }, [open])

  const fetchPriorityEnquiries = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/priority/list")
      if (response.ok) {
        const data = await response.json()
        setEnquiries(data.enquiries || [])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch priority list:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = enquiries.findIndex((e) => e.id === active.id)
      const newIndex = enquiries.findIndex((e) => e.id === over.id)

      const newEnquiries = arrayMove(enquiries, oldIndex, newIndex)
      setEnquiries(newEnquiries)

      // Update ranks on server
      const items = newEnquiries.map((e, index) => ({
        enquiry_id: e.id,
        priority_rank: index + 1,
      }))

      try {
        await fetch("/api/priority/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        })
      } catch (error) {
        console.error("[v0] Failed to reorder:", error)
        // Revert on error
        fetchPriorityEnquiries()
      }
    }
  }

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`/api/enquiries/${id}/priority`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_priority: false }),
      })

      if (response.ok) {
        setEnquiries(enquiries.filter((e) => e.id !== id))
      }
    } catch (error) {
      console.error("[v0] Failed to remove from priority:", error)
    }
  }

  const handleOpen = (id: string) => {
    router.push(`/dashboard/enquiries/${id}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Priority List
          </DialogTitle>
          <DialogDescription>Drag and drop to reorder your priority enquiries</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No priority enquiries yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add enquiries to your priority list to see them here</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={enquiries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {enquiries.map((enquiry) => (
                  <SortableRow key={enquiry.id} enquiry={enquiry} onRemove={handleRemove} onOpen={handleOpen} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </DialogContent>
    </Dialog>
  )
}
