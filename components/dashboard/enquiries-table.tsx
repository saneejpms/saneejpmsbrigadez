"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Pencil, Trash2, Star } from "lucide-react"
import Link from "next/link"
import { deleteEnquiry } from "@/app/actions/enquiries"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PriorityTypeDialog } from "./priority-type-dialog"

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

const statusColors = {
  pending: "secondary",
  in_progress: "default",
  completed: "default",
  cancelled: "destructive",
} as const

const priorityColors = {
  low: "secondary",
  medium: "default",
  high: "default",
  urgent: "destructive",
} as const

export function EnquiriesTable({ enquiries }: { enquiries: Enquiry[] }) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingPriority, setTogglingPriority] = useState<string | null>(null)
  const [showPriorityDialog, setShowPriorityDialog] = useState(false)
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteEnquiry(deleteId)
      router.refresh()
      setDeleteId(null)
    } catch (error) {
      console.error("Failed to delete enquiry:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePriorityToggle = async (id: string, currentStatus: boolean) => {
    if (currentStatus) {
      // Removing from priority - do it directly
      setTogglingPriority(id)
      try {
        const response = await fetch(`/api/enquiries/${id}/priority`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_priority: false }),
        })

        if (response.ok) {
          toast.success("Removed from priority list")
          router.refresh()
        } else {
          toast.error("Failed to remove from priority")
        }
      } catch (error) {
        console.error("[v0] Failed to toggle priority:", error)
        toast.error("Failed to remove from priority")
      } finally {
        setTogglingPriority(null)
      }
    } else {
      // Adding to priority - show dialog to select type
      setSelectedEnquiryId(id)
      setShowPriorityDialog(true)
    }
  }

  const handlePriorityTypeConfirm = async (type: "drawing" | "quote" | "work" | null) => {
    if (!selectedEnquiryId) return

    setTogglingPriority(selectedEnquiryId)
    try {
      const response = await fetch(`/api/enquiries/${selectedEnquiryId}/priority`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_priority: true, priority_type: type }),
      })

      if (response.ok) {
        toast.success("Added to priority list")
        router.refresh()
        setShowPriorityDialog(false)
        setSelectedEnquiryId(null)
      } else {
        toast.error("Failed to add to priority")
      }
    } catch (error) {
      console.error("[v0] Failed to add to priority:", error)
      toast.error("Failed to add to priority")
    } finally {
      setTogglingPriority(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Estimated Value</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enquiries.map((enquiry) => (
              <TableRow key={enquiry.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {enquiry.is_priority && <Star className="h-4 w-4 fill-primary text-primary" />}
                    {enquiry.title}
                  </div>
                </TableCell>
                <TableCell>
                  {enquiry.clients ? (
                    <div>
                      <p className="font-medium">{enquiry.clients.name}</p>
                      {enquiry.clients.company && (
                        <p className="text-xs text-muted-foreground">{enquiry.clients.company}</p>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[enquiry.status as keyof typeof statusColors]}>
                    {enquiry.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityColors[enquiry.priority as keyof typeof priorityColors]}>
                    {enquiry.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {enquiry.estimated_value ? `₹${Number(enquiry.estimated_value).toLocaleString("en-IN")}` : "—"}
                </TableCell>
                <TableCell>
                  {enquiry.start_date ? new Date(enquiry.start_date).toLocaleDateString("en-IN") : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePriorityToggle(enquiry.id, !!enquiry.is_priority)}
                            disabled={togglingPriority === enquiry.id}
                          >
                            <Star className={`h-4 w-4 ${enquiry.is_priority ? "fill-primary text-primary" : ""}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {enquiry.is_priority ? "Remove from priority" : "Add to priority"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/enquiries/${enquiry.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/enquiries/${enquiry.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(enquiry.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the enquiry and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PriorityTypeDialog
        open={showPriorityDialog}
        onOpenChange={setShowPriorityDialog}
        onConfirm={handlePriorityTypeConfirm}
        loading={togglingPriority === selectedEnquiryId}
      />
    </>
  )
}
