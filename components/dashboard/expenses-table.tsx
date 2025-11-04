"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteExpense } from "@/app/actions/expenses"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Expense = {
  id: string
  category: string
  description: string
  amount: number
  date: string
  receipt_url: string | null
  enquiries: {
    id: string
    title: string
  } | null
}

export function ExpensesTable({ expenses }: { expenses: Expense[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    setDeletingId(id)
    try {
      await deleteExpense(id)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete expense:", error)
      alert("Failed to delete expense")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Enquiry</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">{expense.category}</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>
                {expense.enquiries ? (
                  <Link href={`/dashboard/enquiries/${expense.enquiries.id}`} className="text-primary hover:underline">
                    {expense.enquiries.title}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">No enquiry</span>
                )}
              </TableCell>
              <TableCell>{new Date(expense.date).toLocaleDateString("en-IN")}</TableCell>
              <TableCell className="text-right font-medium">
                ₹{Number(expense.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/expenses/${expense.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
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
