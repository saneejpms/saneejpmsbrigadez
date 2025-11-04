"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteMaterial } from "@/app/actions/materials"
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

type Material = {
  id: string
  name: string
  quantity: number
  unit: string
  unit_price: number
  total_price: number
  supplier: string | null
  purchase_date: string | null
  enquiries: {
    id: string
    title: string
  } | null
}

export function MaterialsTable({ materials }: { materials: Material[] }) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteMaterial(deleteId)
      router.refresh()
      setDeleteId(null)
    } catch (error) {
      console.error("Failed to delete material:", error)
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
              <TableHead>Name</TableHead>
              <TableHead>Enquiry</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell>
                  {material.enquiries ? (
                    <Link
                      href={`/dashboard/enquiries/${material.enquiries.id}`}
                      className="text-primary hover:underline"
                    >
                      {material.enquiries.title}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {material.quantity} {material.unit}
                </TableCell>
                <TableCell>₹{Number(material.unit_price).toLocaleString("en-IN")}</TableCell>
                <TableCell className="font-semibold">₹{Number(material.total_price).toLocaleString("en-IN")}</TableCell>
                <TableCell>{material.supplier || "—"}</TableCell>
                <TableCell>
                  {material.purchase_date ? new Date(material.purchase_date).toLocaleDateString("en-IN") : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/materials/${material.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/materials/${material.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(material.id)}>
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
              This action cannot be undone. This will permanently delete the material record.
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
