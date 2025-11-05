"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Pencil, Trash2, Star, Loader2 } from "lucide-react"
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
  priority_types?: ("drawing" | "quote" | "work")[]
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
  const [priorityLoading, setPriorityLoading] = useState(false)
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
      setPriorityLoading(true)
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
          const error = await response.json()
          toast.error(error.error || "Failed to remove from priority")
          console.error("[v0] Remove priority error:", error)
        }
      } catch (error) {
        console.error("[v0] Failed to toggle priority:", error)
        toast.error("Failed to remove from priority")
      } finally {
        setPriorityLoading(false)
      }
    } else {
      setSelectedEnquiryId(id)
      setShowPriorityDialog(true)
    }
  }

  const handlePriorityTypeConfirm = async (types: ("drawing" | "quote" | "work")[]) => {
    if (!selectedEnquiryId || types.length === 0) {
      toast.error("Please select at least one priority type")
      return
    }

    setPriorityLoading(true)
    try {
      console.log("[v0] Adding priority types:", types, "for enquiry:", selectedEnquiryId)

      const response = await fetch(`/api/enquiries/${selectedEnquiryId}/priority`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_priority: true, priority_types: types }),
      })

      const responseData = await response.json()

      if (response.ok) {
        console.log("[v0] Priority added successfully:", responseData)
        toast.success(`Added to priority (${types.length} type${types.length > 1 ? "s" : ""})`)
        setShowPriorityDialog(false)
        setSelectedEnquiryId(null)
        router.refresh()
      } else {
        console.error("[v0] API error:", responseData)
        toast.error(responseData.error || "Failed to add to priority")
      }
    } catch (error) {
      console.error("[v0] Exception in priority handler:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add to priority")
    } finally {
      setPriorityLoading(false)
    }
  }

  return (
    <>
      <div className="rounded-lg glass-card border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10">
                <TableHead className="text-foreground font-semibold">Title</TableHead>
                <TableHead className="text-foreground font-semibold">Client</TableHead>
                <TableHead className="text-foreground font-semibold">Status</TableHead>
                <TableHead className="text-foreground font-semibold">Priority</TableHead>
                <TableHead className="text-foreground font-semibold">Estimated Value</TableHead>
                <TableHead className="text-foreground font-semibold">Start Date</TableHead>
                <TableHead className="text-right text-foreground font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries.map((enquiry, idx) => (
                <TableRow
                  key={enquiry.id}
                  className={`border-white/5 hover:bg-white/5 transition-colors ${idx % 2 === 0 ? "bg-white/2" : ""}`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {enquiry.is_priority && <Star className="h-4 w-4 fill-primary text-primary animate-glow-pulse" />}
                      <span className="text-foreground">{enquiry.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {enquiry.clients ? (
                      <div>
                        <p className="font-medium text-foreground">{enquiry.clients.name}</p>
                        {enquiry.clients.company && (
                          <p className="text-xs text-muted-foreground">{enquiry.clients.company}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusColors[enquiry.status as keyof typeof statusColors]}
                      className="bg-white/10 border border-white/20"
                    >
                      {enquiry.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={priorityColors[enquiry.priority as keyof typeof priorityColors]}
                      className="bg-white/10 border border-white/20"
                    >
                      {enquiry.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {enquiry.estimated_value ? `₹${Number(enquiry.estimated_value).toLocaleString("en-IN")}` : "—"}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {enquiry.start_date ? new Date(enquiry.start_date).toLocaleDateString("en-IN") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePriorityToggle(enquiry.id, !!enquiry.is_priority)}
                              disabled={priorityLoading}
                              className="hover:bg-white/10"
                            >
                              {priorityLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Star
                                  className={`h-4 w-4 transition-colors ${enquiry.is_priority ? "fill-primary text-primary" : "text-muted-foreground"}`}
                                />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="glass-card">
                            {enquiry.is_priority ? "Remove from priority" : "Add to priority"}
                          </TooltipContent>
                        </Tooltip>

                        <Button variant="ghost" size="icon" asChild className="hover:bg-white/10">
                          <Link href={`/dashboard/enquiries/${enquiry.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button variant="ghost" size="icon" asChild className="hover:bg-white/10">
                          <Link href={`/dashboard/enquiries/${enquiry.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(enquiry.id)}
                          className="hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass-modal border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the enquiry and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="glass-button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive/80 hover:bg-destructive text-destructive-foreground"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PriorityTypeDialog
        open={showPriorityDialog}
        onOpenChange={setShowPriorityDialog}
        onConfirm={handlePriorityTypeConfirm}
        loading={priorityLoading}
      />
    </>
  )
}
