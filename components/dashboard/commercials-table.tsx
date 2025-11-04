"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteCommercial } from "@/app/actions/commercials"
import { useRouter } from "next/navigation"
import { useState } from "react"
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

type Commercial = {
  id: string
  item_name: string
  quantity: number
  unit: string
  rate: number
  amount: number
  enquiries: {
    id: string
    title: string
  } | null
}

export function CommercialsTable({ commercials }: { commercials: Commercial[] }) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteCommercial(deleteId)
      router.refresh()
      setDeleteId(null)
    } catch (error) {
      console.error("Failed to delete commercial:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Enquiry</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commercials.map((commercial) => (
              <TableRow key={commercial.id}>
                <TableCell className="font-medium">{commercial.item_name}</TableCell>
                <TableCell>
                  {commercial.enquiries ? (
                    <Link
                      href={`/dashboard/enquiries/${commercial.enquiries.id}`}
                      className="text-primary hover:underline"
                    >
                      {commercial.enquiries.title}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {commercial.quantity} {commercial.unit}
                </TableCell>
                <TableCell>₹{Number(commercial.rate).toLocaleString("en-IN")}</TableCell>
                <TableCell className="font-semibold">₹{Number(commercial.amount).toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/commercials/${commercial.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/commercials/${commercial.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(commercial.id)}>
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
              This action cannot be undone. This will permanently delete the commercial record.
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
    </>
  )
}
