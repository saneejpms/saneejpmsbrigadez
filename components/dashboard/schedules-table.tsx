"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteSchedule } from "@/app/actions/schedules"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Schedule = {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  status: string
  priority: string
  enquiries: {
    id: string
    title: string
  } | null
}

export function SchedulesTable({ schedules }: { schedules: Schedule[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return

    setDeletingId(id)
    try {
      await deleteSchedule(id)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete schedule:", error)
      alert("Failed to delete schedule")
    } finally {
      setDeletingId(null)
    }
  }

  const statusColors = {
    scheduled: "secondary",
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Enquiry</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">{schedule.title}</TableCell>
              <TableCell>
                {schedule.enquiries ? (
                  <Link href={`/dashboard/enquiries/${schedule.enquiries.id}`} className="text-primary hover:underline">
                    {schedule.enquiries.title}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">No enquiry</span>
                )}
              </TableCell>
              <TableCell>{new Date(schedule.start_date).toLocaleDateString("en-IN")}</TableCell>
              <TableCell>{new Date(schedule.end_date).toLocaleDateString("en-IN")}</TableCell>
              <TableCell>
                <Badge variant={statusColors[schedule.status as keyof typeof statusColors]}>
                  {schedule.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={priorityColors[schedule.priority as keyof typeof priorityColors]}>
                  {schedule.priority}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/schedules/${schedule.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(schedule.id)}
                    disabled={deletingId === schedule.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
